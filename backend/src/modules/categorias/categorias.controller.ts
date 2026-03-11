import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Categorias') @ApiBearerAuth() @Controller('categorias')
export class CategoriasController {
  constructor(private s: CategoriasService) {}
  @Get() findAll(@CurrentUser('empresaId') e: string) { return this.s.findAll(e); }
  @Post() create(@Body() dto: any, @CurrentUser('empresaId') e: string) { return this.s.create(dto, e); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: any) { return this.s.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.s.remove(id); }
}
