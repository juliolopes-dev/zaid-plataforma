import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PusherService } from '../pusher/pusher.service';

@Injectable()
export class ConversasService {
  constructor(
    private prisma: PrismaService,
    private pusher: PusherService,
  ) {}

  async listar(filtros?: {
    status?: string;
    atribuidoParaId?: string;
    naoAtribuidas?: boolean;
    pagina?: number;
    limite?: number;
  }) {
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 20;
    const skip = (pagina - 1) * limite;

    const where: any = {};

    if (filtros?.status) {
      where.status = filtros.status;
    }

    if (filtros?.atribuidoParaId) {
      where.atribuidoParaId = filtros.atribuidoParaId;
    }

    if (filtros?.naoAtribuidas) {
      where.atribuidoParaId = null;
    }

    const [conversas, total] = await Promise.all([
      this.prisma.conversa.findMany({
        where,
        skip,
        take: limite,
        include: {
          contato: true,
          atribuidoPara: {
            select: { id: true, nome: true, avatarUrl: true },
          },
        },
        orderBy: { ultimaMensagemEm: 'desc' },
      }),
      this.prisma.conversa.count({ where }),
    ]);

    return {
      data: conversas,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async buscarPorId(id: string) {
    const conversa = await this.prisma.conversa.findUnique({
      where: { id },
      include: {
        contato: true,
        atribuidoPara: {
          select: { id: true, nome: true, avatarUrl: true },
        },
      },
    });

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return conversa;
  }

  async buscarOuCriarPorContato(contatoId: string) {
    let conversa = await this.prisma.conversa.findFirst({
      where: {
        contatoId,
        status: { not: 'FINALIZADA' },
      },
      include: { contato: true },
    });

    if (!conversa) {
      conversa = await this.prisma.conversa.create({
        data: { contatoId },
        include: { contato: true },
      });
    }

    return conversa;
  }

  async atribuir(id: string, usuarioId: string) {
    const conversa = await this.prisma.conversa.update({
      where: { id },
      data: {
        atribuidoParaId: usuarioId,
        status: 'EM_ANDAMENTO',
        iniciadoEm: new Date(),
      },
      include: {
        contato: true,
        atribuidoPara: {
          select: { id: true, nome: true, avatarUrl: true },
        },
      },
    });

    await this.pusher.trigger(`private-user-${usuarioId}`, 'conversa-atribuida', conversa);

    return conversa;
  }

  async transferir(id: string, deUsuarioId: string, paraUsuarioId: string, motivo?: string) {
    const conversa = await this.prisma.conversa.update({
      where: { id },
      data: { atribuidoParaId: paraUsuarioId },
      include: {
        contato: true,
        atribuidoPara: {
          select: { id: true, nome: true, avatarUrl: true },
        },
      },
    });

    await this.prisma.transferencia.create({
      data: {
        conversaId: id,
        deUsuarioId,
        paraUsuarioId,
        motivo,
      },
    });

    await this.pusher.trigger(`private-user-${paraUsuarioId}`, 'conversa-transferida', {
      conversa,
      deUsuarioId,
    });

    return conversa;
  }

  async finalizar(id: string) {
    return this.prisma.conversa.update({
      where: { id },
      data: {
        status: 'FINALIZADA',
        finalizadoEm: new Date(),
      },
    });
  }

  async atualizarUltimaMensagem(id: string, preview: string) {
    return this.prisma.conversa.update({
      where: { id },
      data: {
        ultimaMensagemEm: new Date(),
        previewUltimaMensagem: preview.substring(0, 100),
      },
    });
  }
}
