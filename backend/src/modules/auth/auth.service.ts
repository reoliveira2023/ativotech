import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterEmpresaDto } from './dto/register-empresa.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email: dto.email, ativo: true },
      include: { empresa: true },
    });

    if (!usuario) throw new UnauthorizedException('Email ou senha inválidos');

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);
    if (!senhaValida) throw new UnauthorizedException('Email ou senha inválidos');

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      empresaId: usuario.empresaId,
      role: usuario.role,
    };

    const token = this.jwt.sign(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        cargo: usuario.cargo,
        empresa: {
          id: usuario.empresa.id,
          nome: usuario.empresa.nome,
        },
      },
    };
  }

  async registerEmpresa(dto: RegisterEmpresaDto) {
    const empresaExistente = await this.prisma.empresa.findUnique({
      where: { email: dto.emailEmpresa },
    });
    if (empresaExistente) throw new ConflictException('Email de empresa já cadastrado');

    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: { email: dto.emailAdmin },
    });
    if (usuarioExistente) throw new ConflictException('Email de usuário já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senhaAdmin, 10);

    const empresa = await this.prisma.empresa.create({
      data: {
        nome: dto.nomeEmpresa,
        email: dto.emailEmpresa,
        cnpj: dto.cnpj,
        telefone: dto.telefone,
        usuarios: {
          create: {
            nome: dto.nomeAdmin,
            email: dto.emailAdmin,
            senha: senhaHash,
            role: 'ADMIN',
            cargo: 'Administrador',
          },
        },
        categorias: {
          createMany: {
            data: [
              { nome: 'Notebook', icone: '💻' },
              { nome: 'Desktop', icone: '🖥️' },
              { nome: 'Monitor', icone: '🖥️' },
              { nome: 'Impressora', icone: '🖨️' },
              { nome: 'Smartphone', icone: '📱' },
              { nome: 'Tablet', icone: '📱' },
              { nome: 'Servidor', icone: '🗄️' },
              { nome: 'Switch/Roteador', icone: '🔌' },
              { nome: 'Periférico', icone: '⌨️' },
              { nome: 'Outros', icone: '📦' },
            ],
          },
        },
        departamentos: {
          createMany: {
            data: [
              { nome: 'TI' },
              { nome: 'RH' },
              { nome: 'Financeiro' },
              { nome: 'Comercial' },
              { nome: 'Operações' },
            ],
          },
        },
        localizacoes: {
          createMany: {
            data: [
              { nome: 'Sede' },
              { nome: 'Almoxarifado' },
              { nome: 'Home Office' },
            ],
          },
        },
      },
      include: { usuarios: true },
    });

    const admin = empresa.usuarios[0];
    const payload = {
      sub: admin.id,
      email: admin.email,
      empresaId: empresa.id,
      role: admin.role,
    };

    return {
      access_token: this.jwt.sign(payload),
      usuario: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        role: admin.role,
        empresa: { id: empresa.id, nome: empresa.nome },
      },
    };
  }

  async me(userId: string) {
    return this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        cargo: true,
        empresa: { select: { id: true, nome: true, plano: true } },
      },
    });
  }
}
