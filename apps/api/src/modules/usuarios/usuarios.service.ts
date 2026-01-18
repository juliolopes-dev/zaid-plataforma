import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async criar(criarUsuarioDto: CriarUsuarioDto) {
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: criarUsuarioDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já está em uso');
    }

    const senhaHash = await bcrypt.hash(criarUsuarioDto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        ...criarUsuarioDto,
        senha: senhaHash,
      },
      select: {
        id: true,
        email: true,
        nome: true,
        cargo: true,
        avatarUrl: true,
        estaOnline: true,
        criadoEm: true,
      },
    });

    return usuario;
  }

  async listar(filtros?: { cargo?: string; online?: boolean }) {
    const where: any = {};

    if (filtros?.cargo) {
      where.cargo = filtros.cargo;
    }

    if (filtros?.online !== undefined) {
      where.estaOnline = filtros.online;
    }

    const usuarios = await this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        email: true,
        nome: true,
        cargo: true,
        avatarUrl: true,
        estaOnline: true,
        ultimoAcessoEm: true,
        criadoEm: true,
      },
      orderBy: { nome: 'asc' },
    });

    return { data: usuarios, total: usuarios.length };
  }

  async buscarPorId(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  async buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async atualizar(id: string, atualizarUsuarioDto: AtualizarUsuarioDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const dados: any = { ...atualizarUsuarioDto };

    if (atualizarUsuarioDto.senha) {
      dados.senha = await bcrypt.hash(atualizarUsuarioDto.senha, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: dados,
      select: {
        id: true,
        email: true,
        nome: true,
        cargo: true,
        avatarUrl: true,
        estaOnline: true,
        criadoEm: true,
      },
    });
  }

  async remover(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prisma.usuario.delete({
      where: { id },
    });

    return { message: 'Usuário removido com sucesso' };
  }
}
