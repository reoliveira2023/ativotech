import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(empresaId: string) {
    const [
      totalAtivos,
      ativosPorStatus,
      ativosPorCategoria,
      valorTotal,
      semResponsavel,
      garantiaVencendo,
      ultimosAtivos,
      alertasNaoLidos,
    ] = await Promise.all([
      this.prisma.ativo.count({ where: { empresaId } }),

      this.prisma.ativo.groupBy({
        by: ['status'],
        where: { empresaId },
        _count: { id: true },
      }),

      this.prisma.ativo.groupBy({
        by: ['categoriaId'],
        where: { empresaId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),

      this.prisma.ativo.aggregate({
        where: { empresaId },
        _sum: { valorCompra: true },
      }),

      this.prisma.ativo.count({
        where: { empresaId, responsavelId: null },
      }),

      this.prisma.ativo.count({
        where: {
          empresaId,
          garantiaFim: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      this.prisma.ativo.findMany({
        where: { empresaId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          nome: true,
          status: true,
          createdAt: true,
          categoria: { select: { nome: true, icone: true } },
        },
      }),

      this.prisma.alerta.count({
        where: { empresaId, lido: false },
      }),
    ]);

    const categoriaIds = ativosPorCategoria.map((c) => c.categoriaId).filter(Boolean);
    const categorias = await this.prisma.categoria.findMany({
      where: { id: { in: categoriaIds } },
      select: { id: true, nome: true, icone: true },
    });

    const ativosPorCategoriaFormatado = ativosPorCategoria.map((item) => ({
      categoria: categorias.find((c) => c.id === item.categoriaId)?.nome || 'Sem categoria',
      icone: categorias.find((c) => c.id === item.categoriaId)?.icone || '📦',
      total: item._count.id,
    }));

    const statusMap: Record<string, number> = {};
    ativosPorStatus.forEach((s) => {
      statusMap[s.status] = s._count.id;
    });

    return {
      totalAtivos,
      valorTotal: Number(valorTotal._sum.valorCompra || 0),
      semResponsavel,
      garantiaVencendo,
      alertasNaoLidos,
      statusMap,
      ativosPorCategoria: ativosPorCategoriaFormatado,
      ultimosAtivos,
    };
  }
}
