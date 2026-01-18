# Deploy no EasyPanel

## Pré-requisitos

- EasyPanel instalado na VPS
- Repositório Git (GitHub, GitLab, etc.)

## Passo 1: Subir código para Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repositorio>
git push -u origin main
```

## Passo 2: Criar Projeto no EasyPanel

1. Acesse o EasyPanel
2. Clique em **Create Project**
3. Nome: `zaid`

## Passo 3: Criar Serviço PostgreSQL

1. No projeto, clique em **+ Service**
2. Selecione **Postgres**
3. Configure:
   - **Name:** `postgres`
   - **Database:** `zaid`
   - **Username:** `postgres`
   - **Password:** (gere uma senha segura)

## Passo 4: Criar Serviço Redis

1. Clique em **+ Service**
2. Selecione **Redis**
3. Configure:
   - **Name:** `redis`

## Passo 5: Criar Serviço API (Backend)

1. Clique em **+ Service**
2. Selecione **App**
3. Configure:
   - **Name:** `api`
   - **Source:** GitHub (conecte seu repositório)
   - **Branch:** `main`
   - **Build:** Dockerfile
   - **Dockerfile Path:** `apps/api/Dockerfile`
   - **Port:** `3001`

4. Adicione as variáveis de ambiente:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:<senha>@postgres.zaid.internal:5432/zaid?schema=public
REDIS_URL=redis://redis.zaid.internal:6379
JWT_SECRET=<gere-uma-chave-secreta-forte>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<gere-outra-chave-secreta-forte>
JWT_REFRESH_EXPIRES_IN=7d
EVOLUTION_API_URL=https://evolution.lopestechhub.com.br
EVOLUTION_API_KEY=A7F2D9C4E0B1A8F35C6D2E9A41BC7F8D
FRONTEND_URL=https://zaid.seudominio.com
```

5. Configure o domínio:
   - **Domain:** `api.zaid.seudominio.com`
   - Habilite HTTPS

## Passo 6: Criar Serviço Web (Frontend)

1. Clique em **+ Service**
2. Selecione **App**
3. Configure:
   - **Name:** `web`
   - **Source:** GitHub (mesmo repositório)
   - **Branch:** `main`
   - **Build:** Dockerfile
   - **Dockerfile Path:** `apps/web/Dockerfile`
   - **Port:** `3000`

4. Adicione as variáveis de ambiente (Build Args):

```
NEXT_PUBLIC_API_URL=https://api.zaid.seudominio.com
```

5. Configure o domínio:
   - **Domain:** `zaid.seudominio.com`
   - Habilite HTTPS

## Passo 7: Executar Migrations

Após o deploy do backend, execute as migrations:

1. Acesse o terminal do serviço `api` no EasyPanel
2. Execute:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Passo 8: Configurar Webhook da Evolution API

No painel da Evolution API, configure o webhook:

- **URL:** `https://api.zaid.seudominio.com/api/webhooks/evolution`
- **Eventos:** 
  - ✅ MESSAGES_UPSERT
  - ✅ CONNECTION_UPDATE
  - ✅ QRCODE_UPDATED

## Variáveis de Ambiente

### Backend (API)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | URL do Redis | `redis://host:6379` |
| `JWT_SECRET` | Chave secreta JWT | (gere uma chave forte) |
| `JWT_REFRESH_SECRET` | Chave secreta refresh | (gere uma chave forte) |
| `EVOLUTION_API_URL` | URL da Evolution API | `https://evolution.exemplo.com` |
| `EVOLUTION_API_KEY` | API Key da Evolution | (sua API key) |
| `FRONTEND_URL` | URL do frontend | `https://zaid.exemplo.com` |

### Frontend (Web)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL da API | `https://api.zaid.exemplo.com` |

## Troubleshooting

### Erro de conexão com banco

Verifique se a URL do banco está correta e se o serviço PostgreSQL está rodando.

### Erro de CORS

Verifique se `FRONTEND_URL` está configurado corretamente no backend.

### QR Code não aparece

Verifique se o webhook da Evolution API está configurado corretamente.
