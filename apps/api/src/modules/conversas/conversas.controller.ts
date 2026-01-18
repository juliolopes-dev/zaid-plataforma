import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversasService } from './conversas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator';

@ApiTags('Conversas')
@Controller('conversas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversasController {
  constructor(private readonly conversasService: ConversasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar conversas' })
  listar(
    @Query('status') status?: string,
    @Query('atribuidoParaId') atribuidoParaId?: string,
    @Query('naoAtribuidas') naoAtribuidas?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    return this.conversasService.listar({
      status,
      atribuidoParaId,
      naoAtribuidas: naoAtribuidas === 'true',
      pagina: pagina ? parseInt(pagina, 10) : undefined,
      limite: limite ? parseInt(limite, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar conversa por ID' })
  buscarPorId(@Param('id') id: string) {
    return this.conversasService.buscarPorId(id);
  }

  @Post(':id/atribuir')
  @ApiOperation({ summary: 'Atribuir conversa ao usuário atual' })
  atribuir(@Param('id') id: string, @UsuarioAtual('id') usuarioId: string) {
    return this.conversasService.atribuir(id, usuarioId);
  }

  @Post(':id/transferir')
  @ApiOperation({ summary: 'Transferir conversa para outro usuário' })
  transferir(
    @Param('id') id: string,
    @UsuarioAtual('id') deUsuarioId: string,
    @Body() dados: { paraUsuarioId: string; motivo?: string },
  ) {
    return this.conversasService.transferir(id, deUsuarioId, dados.paraUsuarioId, dados.motivo);
  }

  @Post(':id/finalizar')
  @ApiOperation({ summary: 'Finalizar conversa' })
  finalizar(@Param('id') id: string) {
    return this.conversasService.finalizar(id);
  }
}
