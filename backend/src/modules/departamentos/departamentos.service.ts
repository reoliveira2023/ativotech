import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartamentosService {
  constructor(private prisma: PrismaService) {}
  findAll(empresaId: string) {
    return this.prisma.departamento.findMany({ where: { empresaId }, orderBy: { nome: 'asc' } });
  }
  create(data: any, empresaId: string) {
    return this.prisma.departamento.create({ data: { ...data, empresaId } });
  }
  update(id: string, data: any) {
    return this.prisma.departamento.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.prisma.departamento.delete({ where: { id } });
  }
}
