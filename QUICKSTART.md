# 🚀 Быстрый старт PRO.casa.kz

## ✅ Рабочий способ (прямо сейчас)

### 1. Запустить все в Docker

```bash
# Остановить все процессы
docker compose down -v
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Запустить БД
docker compose up -d postgres

# Подождать 5 секунд
sleep 5

# Создать таблицы и данные
cd backend
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < migrations.sql
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < seed.sql
cd ..
```

### 2. Запустить Backend в Docker

```bash
docker compose up -d backend
```

### 3. Проверить что Backend работает

```bash
# Должен вернуть {"status":"ok",...}
curl http://localhost:3001/health
```

### 4. Запустить Frontend локально

```bash
cd pro-casa
rm -rf .next
npm run dev
```

### 5. Открыть в браузере

http://localhost:3000

**Логин**: admin@casa.kz  
**Пароль**: admin123

## 🐛 Известные проблемы

### Login не работает из-за Prisma

**Проблема**: Prisma Client в Docker backend не может подключиться к PostgreSQL.

**Статус**: В процессе решения. Prisma генерирует клиент во время build и кэширует connection string.

**Временное решение**: 
- Frontend работает ✅
- Backend API работает ✅  
- БД работает ✅
- Только login endpoint возвращает 500

## 📝 Что работает:

- ✅ Docker композиция всех сервисов
- ✅ PostgreSQL с автоинициализацией
- ✅ Frontend (Next.js + shadcn/ui)
- ✅ Backend структура (все роуты созданы)
- ✅ Минималистичный дизайн
- ✅ Красивая login форма

## 🔧 Следующие шаги:

1. Решить Prisma подключение
2. Реализовать CRM модуль
3. Добавить создание пользователей в админ панели
4. Новостройки и шахматка

## 💡 Альтернативный способ тестирования

Если хотите проверить дизайн и UI:

1. Запустите frontend: `cd pro-casa && npm run dev`
2. Откройте http://localhost:3000
3. Увидите login форму (она не будет работать, но дизайн можно оценить)
4. Можно посмотреть код dashboard в `pro-casa/app/dashboard/page.tsx`

## 🆘 Получить помощь

Все файлы готовы для легкого развертывания. Основная проблема - Prisma Client connection в Docker. Решение близко!
