import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MensagensService } from './mensagens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator';

@ApiTags('Mensagens')
@Controller('conversas/:conversaId/mensagens')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MensagensController {
  constructor(private readonly mensagensService: MensagensService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mensagens de uma conversa' })
  listar(
    @Param('conversaId') conversaId: string,
    @Query('cursor') cursor?: string,
    @Query('limite') limite?: string,
  ) {
    return this.mensagensService.listarPorConversa(
      conversaId,
      cursor,
      limite ? parseInt(limite, 10) : undefined,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Enviar mensagem' })
  enviar(
    @Param('conversaId') conversaId: string,
    @UsuarioAtual('id') remetenteId: string,
    @Body() dados: { tipo?: string; conteudo?: string; midiaUrl?: string },
  ) {
    return this.mensagensService.enviar(conversaId, remetenteId, dados);
  }
}
