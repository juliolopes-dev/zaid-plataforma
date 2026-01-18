FROM node:20-alpine AS base
RUN npm install -g pnpm

# ==================== BUILD BACKEND ====================
FROM base AS builder-api
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
RUN cd apps/api && npx prisma generate
RUN pnpm --filter @zaid/api build

# ==================== BUILD FRONTEND ====================
FROM base AS builder-web
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
RUN pnpm --filter @zaid/web build

# ==================== PRODUCTION ====================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache supervisor

# Copia backend
COPY --from=builder-api /app/node_modules ./node_modules
COPY --from=builder-api /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder-api /app/apps/api/dist ./apps/api/dist
COPY --from=builder-api /app/apps/api/package.json ./apps/api/
COPY --from=builder-api /app/apps/api/prisma ./apps/api/prisma

# Copia frontend
COPY --from=builder-web /app/apps/web/.next/standalone ./
COPY --from=builder-web /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder-web /app/apps/web/public ./apps/web/public/

# Script de inicialização
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Configuração do supervisor
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 3000 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
