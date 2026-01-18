# Database Schema - Plataforma Multiatendimento WhatsApp

## Visão Geral

Banco de dados PostgreSQL com Prisma ORM. Estrutura otimizada para multiatendimento com histórico completo de conversas e mensagens.

**Nota:** Todos os nomes de tabelas, colunas e enums estão em português para facilitar o entendimento.

---

## Diagrama de Entidades (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Usuario     │       │     Conversa    │       │    Mensagem     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │──┐    │ id              │──┐    │ id              │
│ email           │  │    │ contatoId       │  │    │ conversaId      │
│ nome            │  │    │ atribuidoParaId │  │    │ remetenteId     │
│ senha           │  └───▶│ status          │  └───▶│ conteudo        │
│ cargo           │       │ ultimaMensagemEm│       │ tipo            │
│ estaOnline      │       │ criadoEm        │       │ status          │
│ criadoEm        │       └─────────────────┘       │ criadoEm        │
└─────────────────┘               │                 └─────────────────┘
                                  │
                                  ▼
                          ┌─────────────────┐
                          │     Contato     │
                          ├─────────────────┤
                          │ id              │
                          │ whatsappId      │
                          │ nome            │
                          │ telefone        │
                          │ fotoPerfilUrl   │
                          │ criadoEm        │
                          └─────────────────┘
```

---

## Schema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS (em português)
// ============================================

enum CargoUsuario {
  ADMIN        // Administrador
  SUPERVISOR   // Supervisor
  ATENDENTE    // Atendente
}

enum StatusConversa {
  PENDENTE      // Aguardando atendimento
  EM_ANDAMENTO  // Em atendimento
  FINALIZADA    // Finalizada
}

enum TipoMensagem {
  TEXTO
  IMAGEM
  AUDIO
  VIDEO
  DOCUMENTO
  STICKER
  LOCALIZACAO
  CONTATO
}

enum StatusMensagem {
  PENDENTE     // Aguardando envio
  ENVIADA      // Enviada
  ENTREGUE     // Entregue
  LIDA         // Lida
  FALHA        // Falha no envio
}

enum DirecaoMensagem {
  RECEBIDA     // Recebida do cliente
  ENVIADA      // Enviada pelo atendente
}

// ============================================
// MODELS (em português)
// ============================================

model Usuario {
  id                String         @id @default(cuid())
  email             String         @unique
  nome              String
  senha             String
  cargo             CargoUsuario   @default(ATENDENTE)
  avatarUrl         String?
  estaOnline        Boolean        @default(false)
  ultimoAcessoEm    DateTime?
  
  // Relacionamentos
  conversasAtribuidas  Conversa[]     @relation("ConversasAtribuidas")
  mensagensEnviadas    Mensagem[]     @relation("MensagensEnviadas")
  transferenciasOrigem Transferencia[] @relation("TransferenciaOrigem")
  transferenciasDestino Transferencia[] @relation("TransferenciaDestino")
  
  criadoEm          DateTime       @default(now())
  atualizadoEm      DateTime       @updatedAt

  @@map("usuarios")
}

model Contato {
  id                String    @id @default(cuid())
  whatsappId        String    @unique  // Número no formato WhatsApp (5511999999999@s.whatsapp.net)
  telefone          String               // Número formatado (+55 11 99999-9999)
  nome              String?              // Nome do contato (pode vir do WhatsApp ou ser editado)
  fotoPerfilUrl     String?              // URL da foto de perfil
  
  // Relacionamentos
  conversas         Conversa[]
  
  criadoEm          DateTime  @default(now())
  atualizadoEm      DateTime  @updatedAt

  @@map("contatos")
}

model Conversa {
  id                   String         @id @default(cuid())
  protocolo            String         @unique @default(cuid()) // Número de protocolo
  status               StatusConversa @default(PENDENTE)
  
  // Relacionamentos
  contato              Contato        @relation(fields: [contatoId], references: [id])
  contatoId            String
  
  atribuidoPara        Usuario?       @relation("ConversasAtribuidas", fields: [atribuidoParaId], references: [id])
  atribuidoParaId      String?
  
  mensagens            Mensagem[]
  transferencias       Transferencia[]
  
  // Metadados
  ultimaMensagemEm     DateTime?
  previewUltimaMensagem String?       // Preview da última mensagem (para listagem)
  quantidadeNaoLidas   Int            @default(0)
  
  // Timestamps
  iniciadoEm           DateTime?      // Quando foi iniciado o atendimento
  finalizadoEm         DateTime?      // Quando foi finalizado
  criadoEm             DateTime       @default(now())
  atualizadoEm         DateTime       @updatedAt

  @@index([status])
  @@index([atribuidoParaId])
  @@index([ultimaMensagemEm])
  @@map("conversas")
}

model Mensagem {
  id                   String          @id @default(cuid())
  whatsappMensagemId   String?         @unique  // ID da mensagem no WhatsApp
  
  // Conteúdo
  conteudo             String?         // Texto da mensagem
  tipo                 TipoMensagem    @default(TEXTO)
  direcao              DirecaoMensagem
  status               StatusMensagem  @default(PENDENTE)
  
  // Mídia (se aplicável)
  midiaUrl             String?         // URL do arquivo no R2
  midiaTipo            String?         // MIME type
  midiaTamanho         Int?            // Tamanho em bytes
  midiaNome            String?         // Nome original do arquivo
  
  // Relacionamentos
  conversa             Conversa        @relation(fields: [conversaId], references: [id], onDelete: Cascade)
  conversaId           String
  
  remetente            Usuario?        @relation("MensagensEnviadas", fields: [remetenteId], references: [id])
  remetenteId          String?         // null = mensagem do cliente
  
  // Timestamps
  criadoEm             DateTime        @default(now())
  atualizadoEm         DateTime        @updatedAt

  @@index([conversaId])
  @@index([criadoEm])
  @@map("mensagens")
}

model Transferencia {
  id                String    @id @default(cuid())
  
  // Relacionamentos
  conversa          Conversa  @relation(fields: [conversaId], references: [id])
  conversaId        String
  
  deUsuario         Usuario   @relation("TransferenciaOrigem", fields: [deUsuarioId], references: [id])
  deUsuarioId       String
  
  paraUsuario       Usuario   @relation("TransferenciaDestino", fields: [paraUsuarioId], references: [id])
  paraUsuarioId     String
  
  // Metadados
  motivo            String?   // Motivo da transferência
  
  criadoEm          DateTime  @default(now())

  @@map("transferencias")
}

model InstanciaWhatsApp {
  id                String    @id @default(cuid())
  nomeInstancia     String    @unique
  instanciaId       String?   // ID retornado pela Evolution API
  status            String    @default("desconectado") // conectado, desconectado, conectando
  qrCode            String?   // QR Code base64 para conexão
  telefone          String?   // Número conectado
  
  criadoEm          DateTime  @default(now())
  atualizadoEm      DateTime  @updatedAt

  @@map("instancias_whatsapp")
}

model RespostaRapida {
  id                String    @id @default(cuid())
  atalho            String    @unique  // Ex: /ola, /preco
  titulo            String              // Título para exibição
  conteudo          String              // Conteúdo da resposta
  
  criadoEm          DateTime  @default(now())
  atualizadoEm      DateTime  @updatedAt

  @@map("respostas_rapidas")
}
```

---

## Índices e Performance

### Índices Principais

| Tabela | Coluna(s) | Tipo | Propósito |
|--------|-----------|------|-----------|
| conversas | status | B-tree | Filtrar por status |
| conversas | atribuido_para_id | B-tree | Listar conversas do atendente |
| conversas | ultima_mensagem_em | B-tree | Ordenar por última mensagem |
| mensagens | conversa_id | B-tree | Buscar mensagens da conversa |
| mensagens | criado_em | B-tree | Ordenar mensagens |
| contatos | whatsapp_id | Unique | Lookup rápido por número |

### Queries Frequentes

```sql
-- Conversas pendentes (inbox geral)
SELECT * FROM conversas 
WHERE status = 'PENDENTE' 
ORDER BY ultima_mensagem_em DESC;

-- Conversas do atendente
SELECT * FROM conversas 
WHERE atribuido_para_id = 'usuario_id' AND status = 'EM_ANDAMENTO'
ORDER BY ultima_mensagem_em DESC;

-- Mensagens de uma conversa (paginado)
SELECT * FROM mensagens 
WHERE conversa_id = 'conversa_id'
ORDER BY criado_em DESC
LIMIT 50 OFFSET 0;
```

---

## Redis - Estruturas de Dados

### Cache

| Key Pattern | Tipo | TTL | Propósito |
|-------------|------|-----|-----------|
| `usuario:{id}` | Hash | 1h | Cache de dados do usuário |
| `conversa:{id}` | Hash | 30min | Cache de conversa ativa |
| `usuarios_online` | Set | - | Lista de usuários online |

### Sessões

| Key Pattern | Tipo | TTL | Propósito |
|-------------|------|-----|-----------|
| `sessao:{usuarioId}` | String | 7d | Refresh token |
| `digitando:{conversaId}:{usuarioId}` | String | 5s | Indicador de digitação |

### Filas (Bull)

| Queue | Propósito |
|-------|-----------|
| `processar-webhook` | Processar webhooks da Evolution API |
| `upload-midia` | Upload de mídia para R2 |
| `notificacoes` | Enviar notificações push |

---

## Migrations

### Comandos Prisma

```bash
# Gerar migration
npx prisma migrate dev --name init

# Aplicar em produção
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate

# Visualizar banco
npx prisma studio
```

---

## Seed (Dados Iniciais)

```typescript
// prisma/seed.ts

import { PrismaClient, CargoUsuario } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const senhaAdmin = await hash('admin123', 10);
  
  await prisma.usuario.upsert({
    where: { email: 'admin@zaid.com' },
    update: {},
    create: {
      email: 'admin@zaid.com',
      nome: 'Administrador',
      senha: senhaAdmin,
      cargo: CargoUsuario.ADMIN,
    },
  });

  // Respostas rápidas padrão
  const respostasRapidas = [
    { atalho: '/ola', titulo: 'Saudação', conteudo: 'Olá! Seja bem-vindo. Como posso ajudá-lo hoje?' },
    { atalho: '/aguarde', titulo: 'Aguarde', conteudo: 'Um momento, por favor. Estou verificando.' },
    { atalho: '/obrigado', titulo: 'Agradecimento', conteudo: 'Obrigado pelo contato! Tenha um ótimo dia.' },
  ];

  for (const rr of respostasRapidas) {
    await prisma.respostaRapida.upsert({
      where: { atalho: rr.atalho },
      update: {},
      create: rr,
    });
  }

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
