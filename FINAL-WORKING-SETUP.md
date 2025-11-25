# ✅ Рабочий способ запуска (100% работает)

## Проблема которую мы решали

Prisma Client не может подключиться к PostgreSQL в Docker из-за проблем с бинарными файлами для Alpine Linux.

## ✅ Решение: Гибридный запуск

### 1️⃣ Запустить только PostgreSQL в Docker

```bash
# Остановить все
docker compose down -v
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Запустить только БД
docker compose up -d postgres

# Подождать 5 секунд
sleep 5

# Создать таблицы и данные
cd backend
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < migrations.sql
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < seed.sql
cd ..
```

### 2️⃣ Запустить Backend локально

Откройте **Terminal 1** и выполните:

```bash
cd backend
rm -rf node_modules/.prisma node_modules/@prisma/client
DATABASE_URL="postgresql://pro_casa_user:pro_casa_dev_password@localhost:5432/pro_casa_db?schema=public" npx prisma generate
DATABASE_URL="postgresql://pro_casa_user:pro_casa_dev_password@localhost:5432/pro_casa_db?schema=public" npm run dev
```

Вы должны увидеть:
```
🚀 Server is running on http://localhost:3001
📊 Environment: development
```

### 3️⃣ Проверить что Backend работает

Откройте **Terminal 2** и выполните:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@casa.kz","password":"admin123"}'
```

Должно вернуть JWT токен:
```json
{"token":"eyJhbGc...","user":{...}}
```

### 4️⃣ Запустить Frontend локально

Откройте **Terminal 3** и выполните:

```bash
cd pro-casa
rm -rf .next
npm run dev
```

### 5️⃣ Открыть в браузере

Перейдите на **http://localhost:3000**

**Логин**: `admin@casa.kz`  
**Пароль**: `admin123`

## 🎉 Должно работать!

После входа вы попадете на Dashboard с сайдбаром и статистикой.

## 📊 Что работает:

- ✅ PostgreSQL в Docker
- ✅ Backend API локально с правильным Prisma подключением
- ✅ Frontend локально
- ✅ Login с JWT аутентификацией
- ✅ Dashboard с минималистичным дизайном
- ✅ Сайдбар с навигацией

## 🔧 Если что-то не работает

### Backend не запускается

```bash
cd backend
rm -rf node_modules
npm install
DATABASE_URL="postgresql://pro_casa_user:pro_casa_dev_password@localhost:5432/pro_casa_db?schema=public" npx prisma generate
DATABASE_URL="postgresql://pro_casa_user:pro_casa_dev_password@localhost:5432/pro_casa_db?schema=public" npm run dev
```

### Frontend показывает ошибку

```bash
cd pro-casa
rm -rf .next node_modules
npm install
npm run dev
```

### БД не отвечает

```bash
docker compose down -v
docker compose up -d postgres
sleep 5
cd backend
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < migrations.sql
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < seed.sql
```

## 🚀 Следующие шаги

Теперь когда все работает, можно:

1. **Реализовать CRM модуль** (управление клиентами)
2. **Добавить модуль новостроек** (проекты и квартиры)
3. **Сделать шахматку квартир**
4. **Добавить создание пользователей** в админ панели
5. **Настроить роли и permissions**

## 💡 Почему это работает, а Docker нет?

1. **Prisma Client** генерируется под host систему (macOS ARM64)
2. **DATABASE_URL** правильно указан при генерации
3. **Нет проблем** с Alpine Linux musl vs glibc
4. **Быстрая разработка** - не нужно каждый раз пересобирать Docker образ

## 🐳 Когда использовать Docker?

Docker будет нужен для:
- Production deployment
- CI/CD pipelines  
- Команды без локального Node.js

Для локальной разработки - гибридный подход быстрее и проще!
