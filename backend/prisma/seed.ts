import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Verificando seed...');

  const exists = await prisma.empresa.findUnique({ where: { email: 'demo@ativotech.com' } });
  if (exists) {
    console.log('✅ Seed já executado. Pulando.');
    return;
  }

  console.log('🌱 Criando dados de demo...');
  const senhaHash = await bcrypt.hash('demo123', 10);

  const empresa = await prisma.empresa.create({
    data: {
      nome: 'TechCorp Demo',
      email: 'demo@ativotech.com',
      cnpj: '00.000.000/0001-00',
      plano: 'PRO',
      usuarios: {
        create: {
          nome: 'Admin Demo',
          email: 'admin@demo.com',
          senha: senhaHash,
          role: 'ADMIN',
          cargo: 'Administrador de TI',
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
            { nome: 'Servidor', icone: '🗄️' },
            { nome: 'Switch/Roteador', icone: '🔌' },
            { nome: 'Periférico', icone: '⌨️' },
            { nome: 'Tablet', icone: '📱' },
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
            { nome: 'Diretoria' },
          ],
        },
      },
      localizacoes: {
        createMany: {
          data: [
            { nome: 'Sede - 1º Andar' },
            { nome: 'Sede - 2º Andar' },
            { nome: 'Almoxarifado' },
            { nome: 'Home Office' },
            { nome: 'Data Center' },
          ],
        },
      },
    },
    include: {
      usuarios: true,
      categorias: true,
      departamentos: true,
      localizacoes: true,
    },
  });

  const notebookCat = empresa.categorias.find((c) => c.nome === 'Notebook');
  const desktopCat = empresa.categorias.find((c) => c.nome === 'Desktop');
  const monitorCat = empresa.categorias.find((c) => c.nome === 'Monitor');
  const smartphoneCat = empresa.categorias.find((c) => c.nome === 'Smartphone');
  const tiDepto = empresa.departamentos.find((d) => d.nome === 'TI');
  const rhDepto = empresa.departamentos.find((d) => d.nome === 'RH');
  const finDepto = empresa.departamentos.find((d) => d.nome === 'Financeiro');
  const sede1 = empresa.localizacoes.find((l) => l.nome === 'Sede - 1º Andar');
  const almox = empresa.localizacoes.find((l) => l.nome === 'Almoxarifado');
  const adminUser = empresa.usuarios[0];

  const ativos = [
    { nome: 'Notebook Dell Latitude 5530', categoriaId: notebookCat?.id, fabricante: 'Dell', modelo: 'Latitude 5530', numeroSerie: 'DL5530001', codigoBarras: 'AT001', valorCompra: 4500, status: 'EM_USO' as const, departamentoId: tiDepto?.id, localizacaoId: sede1?.id, responsavelId: adminUser.id, dataCompra: new Date('2023-01-15'), garantiaFim: new Date('2026-01-15') },
    { nome: 'Notebook Lenovo ThinkPad E15', categoriaId: notebookCat?.id, fabricante: 'Lenovo', modelo: 'ThinkPad E15', numeroSerie: 'LN15002', codigoBarras: 'AT002', valorCompra: 3800, status: 'EM_USO' as const, departamentoId: rhDepto?.id, localizacaoId: sede1?.id, dataCompra: new Date('2022-06-10'), garantiaFim: new Date('2025-06-10') },
    { nome: 'Desktop HP EliteDesk 800', categoriaId: desktopCat?.id, fabricante: 'HP', modelo: 'EliteDesk 800', numeroSerie: 'HP800003', codigoBarras: 'AT003', valorCompra: 3200, status: 'DISPONIVEL' as const, departamentoId: finDepto?.id, localizacaoId: almox?.id, dataCompra: new Date('2021-03-20') },
    { nome: 'Monitor LG 27" 4K', categoriaId: monitorCat?.id, fabricante: 'LG', modelo: '27UK850', numeroSerie: 'LG27004', codigoBarras: 'AT004', valorCompra: 1800, status: 'EM_USO' as const, departamentoId: tiDepto?.id, localizacaoId: sede1?.id, responsavelId: adminUser.id },
    { nome: 'iPhone 14 Pro', categoriaId: smartphoneCat?.id, fabricante: 'Apple', modelo: 'iPhone 14 Pro', numeroSerie: 'IP14005', codigoBarras: 'AT005', valorCompra: 6500, status: 'EM_USO' as const, departamentoId: tiDepto?.id, responsavelId: adminUser.id, dataCompra: new Date('2023-10-01'), garantiaFim: new Date('2025-10-01') },
    { nome: 'MacBook Pro M2', categoriaId: notebookCat?.id, fabricante: 'Apple', modelo: 'MacBook Pro M2', numeroSerie: 'MB006', codigoBarras: 'AT006', valorCompra: 12000, status: 'EM_USO' as const, departamentoId: tiDepto?.id, localizacaoId: sede1?.id, dataCompra: new Date('2023-05-15'), garantiaFim: new Date('2026-05-15') },
    { nome: 'Desktop Dell OptiPlex 7090', categoriaId: desktopCat?.id, fabricante: 'Dell', modelo: 'OptiPlex 7090', numeroSerie: 'DL7090007', codigoBarras: 'AT007', valorCompra: 2800, status: 'MANUTENCAO' as const, departamentoId: rhDepto?.id },
    { nome: 'Monitor Samsung 24"', categoriaId: monitorCat?.id, fabricante: 'Samsung', modelo: 'S24F354F', numeroSerie: 'SAM24008', codigoBarras: 'AT008', valorCompra: 900, status: 'ESTOQUE' as const, localizacaoId: almox?.id, dataCompra: new Date('2020-01-10') },
  ];

  for (const ativo of ativos) {
    await prisma.ativo.create({ data: { ...ativo, empresaId: empresa.id } });
  }

  console.log(`✅ ${ativos.length} ativos de exemplo criados`);
  console.log('🎉 Seed concluído!');
  console.log('📧 Login: admin@demo.com | 🔑 Senha: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
