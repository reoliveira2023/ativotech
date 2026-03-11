import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private service: UsuariosService) {}

  @Get()
  findAll(@CurrentUser('empresaId') empresaId: string) {
    return this.service.findAll(empresaId);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser('empresaId') empresaId: string) {
    return this.service.create(dto, empresaId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser('empresaId') empresaId: string) {
    return this.service.update(id, dto, empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('empresaId') empresaId: string) {
    return this.service.remove(id, empresaId);
  }
}
