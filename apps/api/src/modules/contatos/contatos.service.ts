import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContatosService {
  constructor(private prisma: PrismaService) {}

  async listar(filtros?: { busca?: string; pagina?: number; limite?: number }) {
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 20;
    const skip = (pagina - 1) * limite;

    const where: any = {};

    if (filtros?.busca) {
      where.OR = [
        { nome: { contains: filtros.busca, mode: 'insensitive' } },
        { telefone: { contains: filtros.busca } },
      ];
    }

    const [contatos, total] = await Promise.all([
      this.prisma.contato.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.contato.count({ where }),
    ]);

    return {
      data: contatos,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async buscarPorId(id: string) {
    const contato = await this.prisma.contato.findUnique({
      where: { id },
      include: {
        conversas: {
          orderBy: { criadoEm: 'desc' },
          take: 5,
        },
      },
    });

    if (!contato) {
      throw new NotFoundException('Contato não encontrado');
    }

    return contato;
  }

  async buscarOuCriarPorWhatsappId(whatsappId: string, dados?: { nome?: string; telefone?: string; fotoPerfilUrl?: string }) {
    let contato = await this.prisma.contato.findUnique({
      where: { whatsappId },
    });

    if (!contato) {
      contato = await this.prisma.contato.create({
        data: {
          whatsappId,
          telefone: dados?.telefone || whatsappId.replace('@s.whatsapp.net', ''),
          nome: dados?.nome,
          fotoPerfilUrl: dados?.fotoPerfilUrl,
        },
      });
    }

    return contato;
  }

  async atualizar(id: string, dados: { nome?: string }) {
    const contato = await this.prisma.contato.findUnique({
      where: { id },
    });

    if (!contato) {
      throw new NotFoundException('Contato não encontrado');
    }

    return this.prisma.contato.update({
      where: { id },
      data: dados,
    });
  }
}
