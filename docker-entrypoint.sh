#!/bin/sh
set -e

echo "🔄 Aguardando banco de dados..."
sleep 5

echo "🔄 Executando migrations..."
cd /app/apps/api && npx prisma migrate deploy

echo "🌱 Executando seed..."
cd /app/apps/api && npx prisma db seed || echo "Seed já executado"

echo "🚀 Iniciando serviços..."
exec supervisord -c /etc/supervisord.conf
