import { Module } from '@nestjs/common';
import { Controller, Get, Put, Body } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Injectable()
class EmpresasService {
  constructor(private prisma: PrismaService) {}
  findOne(id: string) {
    return this.prisma.empresa.findUnique({ where: { id }, select: { id: true, nome: true, email: true, cnpj: true, telefone: true, plano: true } });
  }
  update(id: string, data: any) {
    return this.prisma.empresa.update({ where: { id }, data });
  }
}

@ApiTags('Empresa') @ApiBearerAuth() @Controller('empresas')
class EmpresasController {
  constructor(private s: EmpresasService) {}
  @Get('me') me(@CurrentUser('empresaId') id: string) { return this.s.findOne(id); }
  @Put('me') update(@CurrentUser('empresaId') id: string, @Body() dto: any) { return this.s.update(id, dto); }
}

@Module({ controllers: [EmpresasController], providers: [EmpresasService] })
export class EmpresasModule {}
