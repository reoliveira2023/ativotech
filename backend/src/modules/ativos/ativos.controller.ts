import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AtivosService } from './ativos.service';
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Ativos')
@ApiBearerAuth()
@Controller('ativos')
export class AtivosController {
  constructor(private service: AtivosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ativos' })
  findAll(
    @CurrentUser('empresaId') empresaId: string,
    @Query('status') status?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('departamentoId') departamentoId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(empresaId, { status, categoriaId, departamentoId, search });
  }

  @Get('scanner/:codigo')
  @ApiOperation({ summary: 'Buscar ativo por código de barras (scanner)' })
  findByCodigoBarras(
    @Param('codigo') codigo: string,
    @CurrentUser('empresaId') empresaId: string,
  ) {
    return this.service.findByCodigoBarras(codigo, empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('empresaId') empresaId: string) {
    return this.service.findOne(id, empresaId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar ativo' })
  create(
    @Body() dto: CreateAtivoDto,
    @CurrentUser('empresaId') empresaId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.create(dto, empresaId, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAtivoDto,
    @CurrentUser('empresaId') empresaId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, empresaId, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('empresaId') empresaId: string) {
    return this.service.remove(id, empresaId);
  }
}
