#!/bin/bash

echo "🐳 Запуск PRO.casa.kz через Docker..."
echo ""

# Остановить все Node.js процессы
echo "1️⃣ Останавливаю все процессы Node.js..."
pkill -f node 2>/dev/null
pkill -f tsx 2>/dev/null
sleep 2

# Остановить старые контейнеры
echo "2️⃣ Останавливаю старые контейнеры..."
docker compose down

# Собрать и запустить
echo "3️⃣ Собираю и запускаю контейнеры..."
docker compose up --build -d

# Подождать пока контейнеры запустятся
echo "4️⃣ Жду запуска контейнеров..."
sleep 10

# Применить миграции
echo "5️⃣ Применяю миграции базы данных..."
docker compose exec backend npx prisma migrate deploy

# Проверить нужен ли seed
echo ""
echo "❓ Нужно ли заполнить базу тестовыми данными? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📊 Заполняю базу тестовыми данными..."
    docker compose exec backend npm run db:seed
fi

# Показать статус
echo ""
echo "✅ Готово! Статус контейнеров:"
docker compose ps

echo ""
echo "📊 Логи (Ctrl+C для выхода):"
docker compose logs -f
