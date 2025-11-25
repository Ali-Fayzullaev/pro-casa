#!/bin/bash

echo "🚀 Запуск PRO.casa.kz в гибридном режиме..."
echo "   (БД в Docker, Backend и Frontend локально)"
echo ""

# Останавливаем все контейнеры
docker compose down

# Запускаем только PostgreSQL
echo "🐘 Запускаем PostgreSQL..."
docker compose up -d postgres

# Ждем готовности БД
echo "⏳ Ожидаем готовности БД..."
sleep 5

# Создаем таблицы
echo "📋 Создаем таблицы..."
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < backend/migrations.sql 2>/dev/null || echo "Таблицы уже существуют"

# Загружаем seed данные
echo "🌱 Загружаем тестовые данные..."
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < backend/seed.sql 2>&1 | grep -E "(INSERT|status|email|ERROR)" || true

echo ""
echo "✅ БД готова!"
echo ""
echo "📊 Теперь запустите в отдельных терминалах:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    DATABASE_URL=\"postgresql://pro_casa_user:pro_casa_dev_password@localhost:5432/pro_casa_db?schema=public\" npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd pro-casa"
echo "    npm run dev"
echo ""
echo "🌐 После запуска откройте:"
echo "   http://localhost:3000"
echo ""
echo "👤 Логин:"
echo "   admin@casa.kz / admin123"
echo ""
