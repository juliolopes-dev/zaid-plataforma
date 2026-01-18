import { PrismaClient, CargoUsuario } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const senhaAdmin = await hash('admin123', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@zaid.com' },
    update: {},
    create: {
      email: 'admin@zaid.com',
      nome: 'Administrador',
      senha: senhaAdmin,
      cargo: CargoUsuario.ADMIN,
    },
  });
  console.log('✅ Usuário admin criado:', admin.email);

  const senhaAtendente = await hash('atendente123', 10);
  
  const atendente = await prisma.usuario.upsert({
    where: { email: 'atendente@zaid.com' },
    update: {},
    create: {
      email: 'atendente@zaid.com',
      nome: 'Atendente Demo',
      senha: senhaAtendente,
      cargo: CargoUsuario.ATENDENTE,
    },
  });
  console.log('✅ Usuário atendente criado:', atendente.email);

  const respostasRapidas = [
    { atalho: '/ola', titulo: 'Saudação', conteudo: 'Olá! Seja bem-vindo. Como posso ajudá-lo hoje?' },
    { atalho: '/aguarde', titulo: 'Aguarde', conteudo: 'Um momento, por favor. Estou verificando.' },
    { atalho: '/obrigado', titulo: 'Agradecimento', conteudo: 'Obrigado pelo contato! Tenha um ótimo dia.' },
    { atalho: '/horario', titulo: 'Horário', conteudo: 'Nosso horário de atendimento é de segunda a sexta, das 8h às 18h.' },
  ];

  for (const rr of respostasRapidas) {
    await prisma.respostaRapida.upsert({
      where: { atalho: rr.atalho },
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
