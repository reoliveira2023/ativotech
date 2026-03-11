import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TransferenciasService } from './transferencias.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Transferências') @ApiBearerAuth() @Controller('transferencias')
export class TransferenciasController {
  constructor(private s: TransferenciasService) {}
  @Get() findAll(@CurrentUser('empresaId') e: string) { return this.s.findAll(e); }
  @Post() create(@Body() dto: any, @CurrentUser('empresaId') e: string, @CurrentUser('sub') u: string) {
    return this.s.create(dto, e, u);
  }
}
