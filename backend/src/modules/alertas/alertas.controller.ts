import { Controller, Get, Put, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AlertasService } from './alertas.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Alertas') @ApiBearerAuth() @Controller('alertas')
export class AlertasController {
  constructor(private s: AlertasService) {}
  @Get() findAll(@CurrentUser('empresaId') e: string) { return this.s.findAll(e); }
  @Put(':id/lido') marcarLido(@Param('id') id: string, @CurrentUser('empresaId') e: string) { return this.s.marcarLido(id, e); }
  @Put('todos/lidos') marcarTodos(@CurrentUser('empresaId') e: string) { return this.s.marcarTodosLidos(e); }
  @Post('gerar') gerar(@CurrentUser('empresaId') e: string) { return this.s.gerarAlertas(e); }
}
