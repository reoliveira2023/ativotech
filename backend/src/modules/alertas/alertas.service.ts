import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlertasService {
  constructor(private prisma: PrismaService) {}

  async findAll(empresaId: string) {
    return this.prisma.alerta.findMany({
      where: { empresaId },
      orderBy: [{ lido: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async marcarLido(id: string, empresaId: string) {
    return this.prisma.alerta.updateMany({
      where: { id, empresaId },
      data: { lido: true },
    });
  }

  async marcarTodosLidos(empresaId: string) {
    return this.prisma.alerta.updateMany({
      where: { empresaId, lido: false },
      data: { lido: true },
    });
  }

  async gerarAlertas(empresaId: string) {
    const hoje = new Date();
    const em30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Garantia vencendo
    const garantiaVencendo = await this.prisma.ativo.findMany({
      where: { empresaId, garantiaFim: { gte: hoje, lte: em30dias } },
      select: { id: true, nome: true, garantiaFim: true },
    });

    for (const ativo of garantiaVencendo) {
      const existe = await this.prisma.alerta.findFirst({
        where: { empresaId, ativoId: ativo.id, tipo: 'GARANTIA_VENCENDO', lido: false },
      });
      if (!existe) {
        await this.prisma.alerta.create({
          data: {
            empresaId,
            ativoId: ativo.id,
            tipo: 'GARANTIA_VENCENDO',
            titulo: 'Garantia vencendo',
            mensagem: `A garantia do ativo "${ativo.nome}" vence em breve`,
          },
        });
      }
    }

    // Sem responsável
    const semResponsavel = await this.prisma.ativo.findMany({
      where: { empresaId, responsavelId: null, status: 'EM_USO' },
      select: { id: true, nome: true },
    });

    for (const ativo of semResponsavel) {
      const existe = await this.prisma.alerta.findFirst({
        where: { empresaId, ativoId: ativo.id, tipo: 'SEM_RESPONSAVEL', lido: false },
      });
      if (!existe) {
        await this.prisma.alerta.create({
          data: {
            empresaId,
            ativoId: ativo.id,
            tipo: 'SEM_RESPONSAVEL',
            titulo: 'Ativo sem responsável',
            mensagem: `O ativo "${ativo.nome}" está em uso mas sem responsável definido`,
          },
        });
      }
    }

    return { gerados: garantiaVencendo.length + semResponsavel.length };
  }
}
