# Plataforma ZAID - Multiatendimento WhatsApp

Sistema de multiatendimento para WhatsApp com múltiplos atendentes, transferência de conversas e comunicação em tempo real.

## Stack Técnica

- **Frontend:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Backend:** NestJS + TypeScript + Prisma ORM
- **Banco de Dados:** PostgreSQL + Redis
- **Tempo Real:** Pusher
- **WhatsApp:** Evolution API
- **Storage:** Cloudflare R2

## Estrutura do Projeto

```
plataforma-web-zaid/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend NestJS
├── packages/
│   └── shared/       # Types e constantes compartilhadas
├── docs/             # Documentação
└── docker-compose.yml
```

## Requisitos

- Node.js 20+
- pnpm 8+
- Docker e Docker Compose
- PostgreSQL 15+
- Redis 7+

## Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Subir banco de dados (Docker)
docker-compose up -d postgres redis

# Rodar migrations
pnpm db:migrate

# Seed inicial
pnpm db:seed
```

## Desenvolvimento

```bash
# Rodar tudo (frontend + backend)
pnpm dev

# Rodar apenas backend
pnpm dev:api

# Rodar apenas frontend
pnpm dev:web

# Abrir Prisma Studio
pnpm db:studio
```

## URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Prisma Studio:** http://localhost:5555

## Documentação

- [Arquitetura](./docs/ARCHITECTURE.md)
- [Banco de Dados](./docs/DATABASE.md)
- [API](./docs/API.md)
- [Roadmap](./docs/ROADMAP.md)

## Licença

Privado - Todos os direitos reservados.
