FROM node:20-alpine AS base
RUN npm install -g pnpm
RUN apk add --no-cache openssl openssl-dev libc6-compat

# ==================== BUILD BACKEND ====================
FROM base AS builder-api
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile
RUN cd apps/api && npx prisma generate
RUN cd apps/api && pnpm run build
RUN ls -la apps/api/dist/

# ==================== BUILD FRONTEND ====================
FROM base AS builder-web
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile
RUN cd apps/web && pnpm run build

# ==================== PRODUCTION ====================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache supervisor openssl openssl-dev libc6-compat

# Copia backend completo
COPY --from=builder-api /app/node_modules ./node_modules
COPY --from=builder-api /app/apps/api ./apps/api

# Copia frontend
COPY --from=builder-web /app/apps/web/.next/standalone ./
COPY --from=builder-web /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder-web /app/apps/web/public ./apps/web/public/

# Script de inicialização
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Configuração do supervisor
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
