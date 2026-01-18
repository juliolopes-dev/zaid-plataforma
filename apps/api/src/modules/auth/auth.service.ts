import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: usuario.id, email: usuario.email, cargo: usuario.cargo };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    await this.usuariosService.atualizar(usuario.id, { estaOnline: true });

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        cargo: usuario.cargo,
        avatarUrl: usuario.avatarUrl,
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const usuario = await this.usuariosService.buscarPorId(payload.sub);

      if (!usuario) {
        throw new UnauthorizedException('Token inválido');
      }

      const newPayload = { sub: usuario.id, email: usuario.email, cargo: usuario.cargo };
      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        expiresIn: 900,
      };
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async logout(usuarioId: string) {
    await this.usuariosService.atualizar(usuarioId, { estaOnline: false });
    return { message: 'Logout realizado com sucesso' };
  }
}
