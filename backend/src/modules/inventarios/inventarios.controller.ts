import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventariosService } from './inventarios.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Inventários') @ApiBearerAuth() @Controller('inventarios')
export class InventariosController {
  constructor(private s: InventariosService) {}
  @Get() findAll(@CurrentUser('empresaId') e: string) { return this.s.findAll(e); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser('empresaId') e: string) { return this.s.findOne(id, e); }
  @Post() create(@Body() dto: any, @CurrentUser('empresaId') e: string, @CurrentUser('sub') u: string) { return this.s.create(dto, e, u); }
  @Put(':id/itens/:ativoId') verificar(@Param('id') id: string, @Param('ativoId') ativoId: string, @Body() dto: any, @CurrentUser('empresaId') e: string) {
    return this.s.verificarItem(id, ativoId, dto, e);
  }
  @Put(':id/finalizar') finalizar(@Param('id') id: string, @CurrentUser('empresaId') e: string) {
    return this.s.finalizar(id, e);
  }
}
