import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContatosService } from './contatos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contatos')
@Controller('contatos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContatosController {
  constructor(private readonly contatosService: ContatosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contatos' })
  listar(
    @Query('busca') busca?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    return this.contatosService.listar({
      busca,
      pagina: pagina ? parseInt(pagina, 10) : undefined,
      limite: limite ? parseInt(limite, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar contato por ID' })
  buscarPorId(@Param('id') id: string) {
    return this.contatosService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contato' })
  atualizar(@Param('id') id: string, @Body() dados: { nome?: string }) {
    return this.contatosService.atualizar(id, dados);
  }
}
