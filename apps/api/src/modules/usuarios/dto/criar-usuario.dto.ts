import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CargoUsuario {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  ATENDENTE = 'ATENDENTE',
}

export class CriarUsuarioDto {
  @ApiProperty({ example: 'usuario@empresa.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  nome: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @ApiProperty({ enum: CargoUsuario, default: CargoUsuario.ATENDENTE })
  @IsOptional()
  @IsEnum(CargoUsuario, { message: 'Cargo inválido' })
  cargo?: CargoUsuario;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
