import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AtivosModule } from './modules/ativos/ativos.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { DepartamentosModule } from './modules/departamentos/departamentos.module';
import { LocalizacoesModule } from './modules/localizacoes/localizacoes.module';
import { TransferenciasModule } from './modules/transferencias/transferencias.module';
import { InventariosModule } from './modules/inventarios/inventarios.module';
import { AlertasModule } from './modules/alertas/alertas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    EmpresasModule,
    UsuariosModule,
    AtivosModule,
    CategoriasModule,
    DepartamentosModule,
    LocalizacoesModule,
    TransferenciasModule,
    InventariosModule,
    AlertasModule,
    DashboardModule,
    AiModule,
  ],
})
export class AppModule {}
