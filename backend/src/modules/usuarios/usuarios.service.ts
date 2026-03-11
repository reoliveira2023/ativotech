import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll(empresaId: string) {
    return this.prisma.usuario.findMany({
      where: { empresaId, ativo: true },
      select: { id: true, nome: true, email: true, cargo: true, role: true, createdAt: true },
      orderBy: { nome: 'asc' },
    });
  }

  async create(data: any, empresaId: string) {
    const exists = await this.prisma.usuario.findFirst({
      where: { email: data.email, empresaId },
    });
    if (exists) throw new ConflictException('Email já cadastrado nesta empresa');

    const senhaHash = await bcrypt.hash(data.senha, 10);
    return this.prisma.usuario.create({
      data: { ...data, senha: senhaHash, empresaId },
      select: { id: true, nome: true, email: true, cargo: true, role: true },
    });
  }

  async update(id: string, data: any, empresaId: string) {
    const user = await this.prisma.usuario.findFirst({ where: { id, empresaId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (data.senha) data.senha = await bcrypt.hash(data.senha, 10);
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, cargo: true, role: true },
    });
  }

  async remove(id: string, empresaId: string) {
    await this.prisma.usuario.updateMany({ where: { id, empresaId }, data: { ativo: false } });
    return { success: true };
  }
}
