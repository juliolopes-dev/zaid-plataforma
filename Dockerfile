FROM node:20-slim AS base
RUN npm install -g pnpm
RUN apt-get update && apt-get install -y openssl supervisor && rm -rf /var/lib/apt/lists/*

# ==================== BUILD BACKEND ====================
FROM base AS builder-api
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api

RUN pnpm install
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npx tsc -p tsconfig.json
RUN echo "=== Verificando dist ===" && ls -la dist/

# ==================== BUILD FRONTEND ====================
FROM base AS builder-web
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web ./apps/web

RUN pnpm install
RUN cd apps/web && pnpm run build

# ==================== PRODUCTION ====================
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y openssl supervisor && rm -rf /var/lib/apt/lists/*

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
