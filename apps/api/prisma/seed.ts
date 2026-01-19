import { PrismaClient, CargoUsuario, PlanoEmpresa, StatusEmpresa } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar empresa demo
  const empresaDemo = await prisma.empresa.upsert({
    where: { slug: 'empresa-demo' },
    update: {},
    create: {
      nome: 'Empresa Demo',
      slug: 'empresa-demo',
      email: 'contato@empresademo.com',
      telefone: '11999999999',
      plano: PlanoEmpresa.PROFISSIONAL,
      status: StatusEmpresa.ATIVA,
      limiteInstancias: 5,
      limiteUsuarios: 10,
      limiteConversas: 1000,
    },
  });
  console.log('✅ Empresa demo criada:', empresaDemo.nome);

  // Criar super admin (sem empresa)
  const senhaSuperAdmin = await hash('superadmin123', 10);
  const superAdmin = await prisma.usuario.upsert({
    where: { email: 'superadmin@zaid.com' },
    update: {},
    create: {
      email: 'superadmin@zaid.com',
      nome: 'Super Administrador',
      senha: senhaSuperAdmin,
      cargo: CargoUsuario.SUPER_ADMIN,
    },
  });
  console.log('✅ Super Admin criado:', superAdmin.email);

  // Criar admin da empresa
  const senhaAdmin = await hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@zaid.com' },
    update: {},
    create: {
      email: 'admin@zaid.com',
      nome: 'Administrador',
      senha: senhaAdmin,
      cargo: CargoUsuario.ADMIN,
      empresaId: empresaDemo.id,
    },
  });
  console.log('✅ Admin da empresa criado:', admin.email);

  // Criar atendente da empresa
  const senhaAtendente = await hash('atendente123', 10);
  const atendente = await prisma.usuario.upsert({
    where: { email: 'atendente@zaid.com' },
    update: {},
    create: {
      email: 'atendente@zaid.com',
      nome: 'Atendente Demo',
      senha: senhaAtendente,
      cargo: CargoUsuario.ATENDENTE,
      empresaId: empresaDemo.id,
    },
  });
  console.log('✅ Atendente da empresa criado:', atendente.email);

  // Criar respostas rápidas para a empresa
  const respostasRapidas = [
    { atalho: '/ola', titulo: 'Saudação', conteudo: 'Olá! Seja bem-vindo. Como posso ajudá-lo hoje?', empresaId: empresaDemo.id },
    { atalho: '/aguarde', titulo: 'Aguarde', conteudo: 'Um momento, por favor. Estou verificando.', empresaId: empresaDemo.id },
    { atalho: '/obrigado', titulo: 'Agradecimento', conteudo: 'Obrigado pelo contato! Tenha um ótimo dia.', empresaId: empresaDemo.id },
    { atalho: '/horario', titulo: 'Horário', conteudo: 'Nosso horário de atendimento é de segunda a sexta, das 8h às 18h.', empresaId: empresaDemo.id },
  ];

  for (const rr of respostasRapidas) {
    await prisma.respostaRapida.upsert({
      where: { 
        atalho_empresaId: {
          atalho: rr.atalho,
          empresaId: rr.empresaId,
        }
      },
      update: {},
      create: rr,
    });
  }
  console.log('✅ Respostas rápidas criadas');

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
