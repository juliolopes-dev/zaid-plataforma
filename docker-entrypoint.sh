#!/bin/sh
set -e

echo "🔍 Debug: Listando arquivos da API..."
ls -la /app/apps/api/
echo "🔍 Debug: Verificando se dist existe..."
ls -la /app/apps/api/dist/ || echo "❌ Pasta dist NÃO existe!"
echo "🔍 Debug: Verificando main.js..."
ls -la /app/apps/api/dist/main.js || echo "❌ main.js NÃO existe!"

echo "🔄 Aguardando banco de dados..."
sleep 5

echo "🔄 Executando migrations..."
cd /app/apps/api && npx prisma migrate deploy

echo "🌱 Executando seed..."
cd /app/apps/api && npx prisma db seed || echo "Seed já executado"

echo "🚀 Iniciando serviços..."
exec supervisord -c /etc/supervisord.conf
