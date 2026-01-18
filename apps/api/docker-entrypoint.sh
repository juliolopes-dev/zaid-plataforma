#!/bin/sh
set -e

echo "🔄 Aguardando banco de dados..."
sleep 5

echo "🔄 Executando migrations..."
npx prisma migrate deploy

echo "🌱 Executando seed (se necessário)..."
npx prisma db seed || echo "Seed já executado ou não configurado"

echo "🚀 Iniciando aplicação..."
exec node dist/main.js
