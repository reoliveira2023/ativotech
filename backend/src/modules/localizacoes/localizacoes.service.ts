import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LocalizacoesService {
  constructor(private prisma: PrismaService) {}
  findAll(empresaId: string) {
    return this.prisma.localizacao.findMany({ where: { empresaId }, orderBy: { nome: 'asc' } });
  }
  create(data: any, empresaId: string) {
    return this.prisma.localizacao.create({ data: { ...data, empresaId } });
  }
  update(id: string, data: any) {
    return this.prisma.localizacao.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.prisma.localizacao.delete({ where: { id } });
  }
}
