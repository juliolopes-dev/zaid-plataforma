# Arquitetura - Plataforma Multiatendimento WhatsApp

## Visão Geral

Sistema de multiatendimento para WhatsApp que permite múltiplos atendentes gerenciarem conversas de clientes em um único número, com transferência de conversas e comunicação em tempo real.

---

## Stack Técnica

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Next.js | 14+ | Framework React com App Router |
| TypeScript | 5+ | Tipagem estática |
| Tailwind CSS | 3+ | Estilização utility-first |
| shadcn/ui | latest | Componentes UI |
| Pusher JS | latest | Cliente WebSocket para tempo real |

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| NestJS | 10+ | Framework Node.js enterprise |
| TypeScript | 5+ | Tipagem estática |
| Prisma | 5+ | ORM type-safe |
| Pusher | latest | Servidor WebSocket |

### Banco de Dados
| Tecnologia | Propósito |
|------------|-----------|
| PostgreSQL | Dados principais (usuários, conversas, mensagens) |
| Redis | Cache, sessões, filas de jobs |

### Infraestrutura
| Serviço | Propósito |
|---------|-----------|
| Evolution API | Integração WhatsApp |
| Cloudflare R2 | Armazenamento de mídia (imagens, áudios, docs) |
| Pusher | WebSocket gerenciado |
| Easypanel | Orquestração Docker na VPS |

---

## Estrutura de Pastas (Monorepo)

```
plataforma-web-zaid/
├── docs/                       # Documentação do projeto
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   └── ROADMAP.md
│
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/            # App Router (páginas)
│   │   │   ├── components/     # Componentes React
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilitários, API client
│   │   │   ├── stores/         # Estado global (Zustand)
│   │   │   └── types/          # TypeScript types
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── api/                    # Backend NestJS
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       # Autenticação JWT
│       │   │   ├── users/      # Gestão de usuários/atendentes
│       │   │   ├── contacts/   # Contatos WhatsApp
│       │   │   ├── conversations/ # Conversas
│       │   │   ├── messages/   # Mensagens
│       │   │   ├── whatsapp/   # Integração Evolution API
│       │   │   └── realtime/   # Pusher events
│       │   ├── common/         # Guards, interceptors, filters
│       │   ├── config/         # Configurações
│       │   └── prisma/         # Prisma service
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   └── shared/                 # Código compartilhado
│       ├── types/              # Types compartilhados
│       └── constants/          # Constantes
│
├── docker-compose.yml          # Dev environment
├── docker-compose.prod.yml     # Production
├── package.json                # Workspaces root
├── pnpm-workspace.yaml
└── README.md
```

---

## Fluxo de Dados Principal

### 1. Recebimento de Mensagem (WhatsApp → Sistema)

```
┌─────────────┐     Webhook      ┌─────────────┐     Pusher      ┌─────────────┐
│  Evolution  │ ───────────────▶ │   NestJS    │ ──────────────▶ │   Next.js   │
│    API      │                  │   Backend   │                 │   Frontend  │
└─────────────┘                  └─────────────┘                 └─────────────┘
                                       │
                                       ▼
                                 ┌─────────────┐
                                 │ PostgreSQL  │
                                 │   + Redis   │
                                 └─────────────┘
```

**Passos:**
1. Cliente envia mensagem no WhatsApp
2. Evolution API recebe e dispara webhook para NestJS
3. NestJS processa, salva no PostgreSQL
4. NestJS dispara evento Pusher
5. Frontend recebe em tempo real e atualiza UI

### 2. Envio de Mensagem (Sistema → WhatsApp)

```
┌─────────────┐     HTTP POST    ┌─────────────┐     HTTP POST   ┌─────────────┐
│   Next.js   │ ───────────────▶ │   NestJS    │ ──────────────▶ │  Evolution  │
│   Frontend  │                  │   Backend   │                 │    API      │
└─────────────┘                  └─────────────┘                 └─────────────┘
```

**Passos:**
1. Atendente digita mensagem no frontend
2. Frontend envia para API NestJS
3. NestJS valida, salva no banco
4. NestJS envia para Evolution API
5. Evolution API entrega no WhatsApp

### 3. Transferência de Conversa

```
┌─────────────┐     Transfer     ┌─────────────┐     Pusher      ┌─────────────┐
│ Atendente A │ ───────────────▶ │   NestJS    │ ──────────────▶ │ Atendente B │
└─────────────┘                  └─────────────┘                 └─────────────┘
```

**Passos:**
1. Atendente A clica em "Transferir"
2. Seleciona Atendente B
3. Backend atualiza `assignedTo` da conversa
4. Pusher notifica Atendente B
5. Conversa aparece no inbox do Atendente B

---

## Autenticação

| Método | Uso |
|--------|-----|
| JWT Access Token | Autenticação de requests (15min expiry) |
| JWT Refresh Token | Renovação do access token (7 dias expiry) |
| HttpOnly Cookies | Armazenamento seguro dos tokens |

### Fluxo de Login

```
1. POST /auth/login (email, password)
2. Backend valida credenciais
3. Retorna access_token + refresh_token (cookies)
4. Frontend usa access_token no header Authorization
5. Quando expira, POST /auth/refresh renova
```

---

## Comunicação em Tempo Real (Pusher)

### Canais

| Canal | Propósito |
|-------|-----------|
| `private-user-{userId}` | Notificações pessoais do atendente |
| `private-conversation-{id}` | Mensagens de uma conversa específica |
| `presence-inbox` | Quem está online (presença) |

### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `new-message` | Message object | Nova mensagem recebida |
| `conversation-assigned` | Conversation object | Conversa atribuída |
| `conversation-transferred` | Conversation object | Conversa transferida |
| `typing` | { conversationId, userId } | Indicador de digitação |

---

## Escalabilidade (Futuro)

### Horizontal Scaling
- **Backend**: Múltiplas instâncias NestJS atrás de load balancer
- **Redis**: Pub/Sub para sincronizar instâncias
- **PostgreSQL**: Read replicas para queries pesadas

### Otimizações Planejadas
- [ ] Paginação com cursor para mensagens
- [ ] Cache de conversas ativas no Redis
- [ ] Queue (Bull) para processamento de webhooks
- [ ] CDN para assets estáticos

---

## Variáveis de Ambiente

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/zaid
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key
EVOLUTION_INSTANCE_NAME=zaid-instance

# Pusher
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=sa1

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=zaid-media
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=sa1
```
