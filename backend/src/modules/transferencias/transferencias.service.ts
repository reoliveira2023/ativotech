import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransferenciasService {
  constructor(private prisma: PrismaService) {}

  async findAll(empresaId: string) {
    return this.prisma.transferencia.findMany({
      where: { ativo: { empresaId } },
      include: {
        ativo: { select: { id: true, nome: true, categoria: { select: { nome: true, icone: true } } } },
        deUsuario: { select: { nome: true } },
        paraUsuario: { select: { nome: true } },
        deDepartamento: { select: { nome: true } },
        paraDepartamento: { select: { nome: true } },
        deLocalizacao: { select: { nome: true } },
        paraLocalizacao: { select: { nome: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(data: any, empresaId: string, userId: string) {
    const ativo = await this.prisma.ativo.findFirst({ where: { id: data.ativoId, empresaId } });
    if (!ativo) throw new NotFoundException('Ativo não encontrado');

    const transferencia = await this.prisma.transferencia.create({
      data: {
        ativoId: data.ativoId,
        deUsuarioId: ativo.responsavelId,
        paraUsuarioId: data.paraUsuarioId,
        deDepartamentoId: ativo.departamentoId,
        paraDepartamentoId: data.paraDepartamentoId,
        deLocalizacaoId: ativo.localizacaoId,
        paraLocalizacaoId: data.paraLocalizacaoId,
        motivo: data.motivo,
        realizadoPorId: userId,
      },
    });

    // Update ativo
    await this.prisma.ativo.update({
      where: { id: data.ativoId },
      data: {
        responsavelId: data.paraUsuarioId || ativo.responsavelId,
        departamentoId: data.paraDepartamentoId || ativo.departamentoId,
        localizacaoId: data.paraLocalizacaoId || ativo.localizacaoId,
        status: data.paraUsuarioId ? 'EM_USO' : 'DISPONIVEL',
      },
    });

    await this.prisma.historicoAtivo.create({
      data: {
        ativoId: data.ativoId,
        usuarioId: userId,
        acao: 'TRANSFERIDO',
        valorNovo: data.motivo || 'Transferência realizada',
      },
    });

    return transferencia;
  }
}
