import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventariosService {
  constructor(private prisma: PrismaService) {}

  async findAll(empresaId: string) {
    return this.prisma.inventario.findMany({
      where: { empresaId },
      include: {
        responsavel: { select: { nome: true } },
        _count: { select: { itens: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, empresaId: string) {
    const inv = await this.prisma.inventario.findFirst({
      where: { id, empresaId },
      include: {
        itens: {
          include: {
            ativo: {
              include: {
                categoria: { select: { nome: true, icone: true } },
                responsavel: { select: { nome: true } },
              },
            },
          },
        },
        responsavel: { select: { nome: true } },
      },
    });
    if (!inv) throw new NotFoundException('Inventário não encontrado');
    return inv;
  }

  async create(data: any, empresaId: string, userId: string) {
    // Auto-populate with all ativos da empresa
    const ativos = await this.prisma.ativo.findMany({
      where: { empresaId, status: { not: 'DESCARTADO' } },
      select: { id: true },
    });

    return this.prisma.inventario.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        empresaId,
        responsavelId: userId,
        itens: {
          createMany: {
            data: ativos.map((a) => ({ ativoId: a.id })),
          },
        },
      },
      include: { _count: { select: { itens: true } } },
    });
  }

  async verificarItem(inventarioId: string, ativoId: string, data: any, empresaId: string) {
    const inv = await this.prisma.inventario.findFirst({ where: { id: inventarioId, empresaId } });
    if (!inv) throw new NotFoundException('Inventário não encontrado');

    return this.prisma.inventarioItem.updateMany({
      where: { inventarioId, ativoId },
      data: {
        status: data.status || 'VERIFICADO',
        divergencia: data.divergencia,
        verificadoEm: new Date(),
      },
    });
  }

  async finalizar(id: string, empresaId: string) {
    const inv = await this.prisma.inventario.findFirst({ where: { id, empresaId } });
    if (!inv) throw new NotFoundException('Inventário não encontrado');
    return this.prisma.inventario.update({
      where: { id },
      data: { status: 'FINALIZADO', finalizadoEm: new Date() },
    });
  }
}
