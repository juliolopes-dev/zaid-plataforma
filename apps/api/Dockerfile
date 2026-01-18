FROM node:20-alpine AS builder

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Instala dependências
RUN pnpm install --frozen-lockfile

# Copia código fonte
COPY apps/api ./apps/api

# Gera Prisma Client
RUN cd apps/api && npx prisma generate

# Build
RUN pnpm --filter @zaid/api build

# Produção
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# Copia dependências e build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main.js"]
