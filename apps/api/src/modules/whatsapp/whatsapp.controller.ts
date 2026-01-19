import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('instancias')
  @ApiOperation({ summary: 'Listar todas as instâncias' })
  listarInstancias(@Request() req: any) {
    const empresaId = req.user?.empresaId;
    return this.whatsappService.listarInstancias(empresaId);
  }

  @Post('instancias')
  @ApiOperation({ summary: 'Criar nova instância' })
  criarInstancia(@Request() req: any, @Body() body: { nome: string }) {
    const empresaId = req.user?.empresaId;
    return this.whatsappService.criarInstancia(body.nome, empresaId);
  }

  @Get('instancias/:nome')
  @ApiOperation({ summary: 'Obter status de uma instância' })
  obterStatusInstancia(@Param('nome') nome: string) {
    return this.whatsappService.obterStatusInstancia(nome);
  }

  @Delete('instancias/:nome')
  @ApiOperation({ summary: 'Deletar uma instância' })
  deletarInstancia(@Param('nome') nome: string) {
    return this.whatsappService.deletarInstancia(nome);
  }

  @Post('instancias/:nome/conectar')
  @ApiOperation({ summary: 'Conectar instância (gera QR Code)' })
  conectarInstancia(@Param('nome') nome: string) {
    return this.whatsappService.conectarInstancia(nome);
  }

  @Post('instancias/:nome/desconectar')
  @ApiOperation({ summary: 'Desconectar instância' })
  desconectarInstancia(@Param('nome') nome: string) {
    return this.whatsappService.desconectarInstancia(nome);
  }
}
