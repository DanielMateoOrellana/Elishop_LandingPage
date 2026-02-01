#!/bin/sh
set -e

echo "🛠️  Generando cliente de Prisma..."
npx prisma generate

echo "🗄️  Sincronizando base de datos..."
npx prisma db push --accept-data-loss

echo "🌱 Ejecutando Seed (Datos iniciales)..."
# Usamos || true para que no falle si ya existen datos únicos
npx prisma db seed || echo "⚠️  Seed terminó con advertencias."

echo "🚀 Iniciando aplicación en modo DEV..."
# Usamos start normal (nest start) que compila en memoria o al vuelo
npm run start
