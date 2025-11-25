#!/bin/bash

echo "🚀 Развертывание PRO.casa.kz платформы..."

# Останавливаем старые контейнеры
echo "📦 Останавливаем старые контейнеры..."
docker compose down

# Собираем и запускаем все сервисы
echo "🔨 Собираем Docker образы..."
docker compose build

echo "▶️  Запускаем все сервисы..."
docker compose up -d

# Ждем пока БД будет готова
echo "⏳ Ожидаем готовности PostgreSQL..."
sleep 5

# Создаем таблицы
echo "📋 Создаем таблицы БД..."
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < backend/migrations.sql

# Загружаем seed данные
echo "🌱 Загружаем тестовые данные..."
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < backend/seed.sql

echo ""
echo "✅ Развертывание завершено!"
echo ""
echo "📊 Статус сервисов:"
docker compose ps
echo ""
echo "🌐 Приложение доступно по адресам:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:3001"
echo "  - Database: localhost:5432"
echo ""
echo "👤 Тестовые аккаунты:"
echo "  - Админ:       admin@casa.kz / admin123"
echo "  - Брокер:      broker@casa.kz / broker123"
echo "  - Застройщик:  developer@casa.kz / developer123"
echo ""
echo "📝 Полезные команды:"
echo "  - Просмотр логов:      docker compose logs -f"
echo "  - Остановка:           docker compose down"
echo "  - Перезапуск:          docker compose restart"
echo "  - БД консоль:          docker exec -it pro-casa-db psql -U pro_casa_user -d pro_casa_db"
echo ""
