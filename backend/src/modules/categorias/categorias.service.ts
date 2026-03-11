import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}
  findAll(empresaId: string) {
    return this.prisma.categoria.findMany({ where: { empresaId }, orderBy: { nome: 'asc' } });
  }
  create(data: any, empresaId: string) {
    return this.prisma.categoria.create({ data: { ...data, empresaId } });
  }
  update(id: string, data: any) {
    return this.prisma.categoria.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.prisma.categoria.delete({ where: { id } });
  }
}
