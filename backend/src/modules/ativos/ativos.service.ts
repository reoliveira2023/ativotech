import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';

@Injectable()
export class AtivosService {
  constructor(private prisma: PrismaService) {}

  async findAll(empresaId: string, filters?: any) {
    const where: any = { empresaId };

    if (filters?.status) where.status = filters.status;
    if (filters?.categoriaId) where.categoriaId = filters.categoriaId;
    if (filters?.departamentoId) where.departamentoId = filters.departamentoId;
    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { numeroSerie: { contains: filters.search, mode: 'insensitive' } },
        { codigoBarras: { contains: filters.search, mode: 'insensitive' } },
        { modelo: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.ativo.findMany({
      where,
      include: {
        categoria: { select: { id: true, nome: true, icone: true } },
        departamento: { select: { id: true, nome: true } },
        localizacao: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, empresaId: string) {
    const ativo = await this.prisma.ativo.findFirst({
      where: { id, empresaId },
      include: {
        categoria: true,
        departamento: true,
        localizacao: true,
        responsavel: { select: { id: true, nome: true, email: true, cargo: true } },
        historicos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { usuario: { select: { nome: true } } },
        },
        transferencias: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            deUsuario: { select: { nome: true } },
            paraUsuario: { select: { nome: true } },
            deDepartamento: { select: { nome: true } },
            paraDepartamento: { select: { nome: true } },
          },
        },
      },
    });

    if (!ativo) throw new NotFoundException('Ativo não encontrado');
    return ativo;
  }

  async findByCodigoBarras(codigoBarras: string, empresaId: string) {
    return this.prisma.ativo.findFirst({
      where: { codigoBarras, empresaId },
      include: {
        categoria: { select: { id: true, nome: true, icone: true } },
        departamento: { select: { id: true, nome: true } },
        localizacao: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true } },
      },
    });
  }

  async create(dto: CreateAtivoDto, empresaId: string, userId: string) {
    const ativo = await this.prisma.ativo.create({
      data: {
        ...dto,
        empresaId,
        valorCompra: dto.valorCompra ? dto.valorCompra : undefined,
        dataCompra: dto.dataCompra ? new Date(dto.dataCompra) : undefined,
        garantiaFim: dto.garantiaFim ? new Date(dto.garantiaFim) : undefined,
      },
    });

    await this.prisma.historicoAtivo.create({
      data: {
        ativoId: ativo.id,
        usuarioId: userId,
        acao: 'CRIADO',
        valorNovo: ativo.nome,
      },
    });

    return ativo;
  }

  async update(id: string, dto: UpdateAtivoDto, empresaId: string, userId: string) {
    const ativo = await this.findOne(id, empresaId);

    const updated = await this.prisma.ativo.update({
      where: { id },
      data: {
        ...dto,
        valorCompra: dto.valorCompra ? dto.valorCompra : undefined,
        dataCompra: dto.dataCompra ? new Date(dto.dataCompra) : undefined,
        garantiaFim: dto.garantiaFim ? new Date(dto.garantiaFim) : undefined,
      },
    });

    await this.prisma.historicoAtivo.create({
      data: {
        ativoId: id,
        usuarioId: userId,
        acao: 'ATUALIZADO',
        valorAnterior: JSON.stringify(ativo),
        valorNovo: JSON.stringify(updated),
      },
    });

    return updated;
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.prisma.ativo.delete({ where: { id } });
  }
}
