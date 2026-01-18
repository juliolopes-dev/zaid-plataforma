import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversasService } from '../conversas/conversas.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { PusherService } from '../pusher/pusher.service';

@Injectable()
export class MensagensService {
  constructor(
    private prisma: PrismaService,
    private conversas: ConversasService,
    private whatsapp: WhatsappService,
    private pusher: PusherService,
  ) {}

  async listarPorConversa(conversaId: string, cursor?: string, limite = 50) {
    const where: any = { conversaId };

    if (cursor) {
      where.criadoEm = { lt: new Date(cursor) };
    }

    const mensagens = await this.prisma.mensagem.findMany({
      where,
      take: limite + 1,
      orderBy: { criadoEm: 'desc' },
      include: {
        remetente: {
          select: { id: true, nome: true, avatarUrl: true },
        },
      },
    });

    const temMais = mensagens.length > limite;
    const dados = temMais ? mensagens.slice(0, -1) : mensagens;

    return {
      data: dados.reverse(),
      proximoCursor: temMais ? dados[0]?.criadoEm?.toISOString() : null,
      temMais,
    };
  }

  async enviar(conversaId: string, remetenteId: string, dados: { tipo?: string; conteudo?: string; midiaUrl?: string }) {
    const conversa = await this.prisma.conversa.findUnique({
      where: { id: conversaId },
      include: { contato: true },
    });

    if (!conversa) {
      throw new Error('Conversa não encontrada');
    }

    const mensagem = await this.prisma.mensagem.create({
      data: {
        conversaId,
        remetenteId,
        conteudo: dados.conteudo,
        tipo: (dados.tipo as any) || 'TEXTO',
        direcao: 'ENVIADA',
        status: 'PENDENTE',
        midiaUrl: dados.midiaUrl,
      },
      include: {
        remetente: {
          select: { id: true, nome: true, avatarUrl: true },
        },
      },
    });

    await this.conversas.atualizarUltimaMensagem(conversaId, dados.conteudo || '[Mídia]');

    try {
      // TODO: Buscar instância ativa do banco ou configuração
      const instanciaPadrao = 'JulioLopes';
      const resultado = await this.whatsapp.enviarMensagem(
        instanciaPadrao,
        conversa.contato.whatsappId,
        dados.conteudo || '',
        dados.tipo || 'TEXTO',
        dados.midiaUrl,
      );

      await this.prisma.mensagem.update({
        where: { id: mensagem.id },
        data: {
          whatsappMensagemId: resultado.messageId,
          status: 'ENVIADA',
        },
      });

      mensagem.status = 'ENVIADA' as any;
    } catch (error) {
      await this.prisma.mensagem.update({
        where: { id: mensagem.id },
        data: { status: 'FALHA' },
      });
      mensagem.status = 'FALHA' as any;
    }

    await this.pusher.trigger(`private-conversa-${conversaId}`, 'nova-mensagem', mensagem);

    return mensagem;
  }

  async receberDoWhatsapp(whatsappId: string, dados: {
    messageId: string;
    conteudo?: string;
    tipo?: string;
    midiaUrl?: string;
    timestamp: number;
  }) {
    let contato = await this.prisma.contato.findUnique({
      where: { whatsappId },
    });

    if (!contato) {
      contato = await this.prisma.contato.create({
        data: {
          whatsappId,
          telefone: whatsappId.replace('@s.whatsapp.net', ''),
        },
      });
    }

    let conversa = await this.prisma.conversa.findFirst({
      where: {
        contatoId: contato.id,
        status: { not: 'FINALIZADA' },
      },
    });

    if (!conversa) {
      conversa = await this.prisma.conversa.create({
        data: { contatoId: contato.id },
      });
    }

    const mensagem = await this.prisma.mensagem.create({
      data: {
        conversaId: conversa.id,
        whatsappMensagemId: dados.messageId,
        conteudo: dados.conteudo,
        tipo: (dados.tipo as any) || 'TEXTO',
        direcao: 'RECEBIDA',
        status: 'ENTREGUE',
        midiaUrl: dados.midiaUrl,
      },
    });

    await this.conversas.atualizarUltimaMensagem(conversa.id, dados.conteudo || '[Mídia]');

    await this.prisma.conversa.update({
      where: { id: conversa.id },
      data: { quantidadeNaoLidas: { increment: 1 } },
    });

    const mensagemCompleta = await this.prisma.mensagem.findUnique({
      where: { id: mensagem.id },
      include: { conversa: { include: { contato: true } } },
    });

    await this.pusher.trigger(`private-conversa-${conversa.id}`, 'nova-mensagem', mensagemCompleta);

    if (conversa.atribuidoParaId) {
      await this.pusher.trigger(`private-user-${conversa.atribuidoParaId}`, 'nova-mensagem', mensagemCompleta);
    }

    return mensagem;
  }
}
