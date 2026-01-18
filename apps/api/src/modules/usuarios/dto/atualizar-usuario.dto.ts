import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CriarUsuarioDto } from './criar-usuario.dto';

export class AtualizarUsuarioDto extends PartialType(CriarUsuarioDto) {
  @IsOptional()
  @IsBoolean()
  estaOnline?: boolean;
}
