# 🚀 Быстрый старт PRO.casa.kz

## ⚡ Одна команда для запуска всего!

Откройте **3 терминала** в папке проекта:

### Terminal 1: БД

```bash
# Остановить локальный PostgreSQL (только первый раз)
brew services stop postgresql@14

# Запустить PostgreSQL в Docker
./start-dev.sh
```

### Terminal 2: Backend

```bash
cd backend
npm run dev
```

Вы увидите:
```
DATABASE_URL: SET
🚀 Server is running on http://localhost:3001
📊 Environment: development
```

### Terminal 3: Frontend

```bash
cd pro-casa  
npm run dev
```

Вы увидите:
```
▲ Next.js 16.0.3 (Turbopack)
- Local:   http://localhost:3000
✓ Ready in 883ms
```

## 🌐 Откройте в браузере

**http://localhost:3000**

### Логин:
- **Email:** `admin@casa.kz`
- **Пароль:** `admin123`

## ✅ Что должно работать:

1. **Login форма** - минималистичный дизайн с иконкой дома
2. **JWT аутентификация** - получение токена
3. **Dashboard** - главная страница с сайдбаром
4. **Sidebar** - навигация по разделам
5. **Logout** - выход из системы

## 🐛 Если что-то не работает:

### Backend не запускается

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run dev
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
# Пересоздать контейнер
docker compose down -v
docker compose up -d postgres
sleep 5

# Создать таблицы
cd backend
PGPASSWORD=pro_casa_dev_password psql -h 127.0.0.1 -p 5432 -U pro_casa_user -d pro_casa_db < migrations.sql
PGPASSWORD=pro_casa_dev_password psql -h 127.0.0.1 -p 5432 -U pro_casa_user -d pro_casa_db < seed.sql
```

## 📝 Полезные команды:

### Проверить что БД работает

```bash
PGPASSWORD=pro_casa_dev_password psql -h 127.0.0.1 -p 5432 -U pro_casa_user -d pro_casa_db -c "SELECT email, role FROM users;"
```

### Проверить Backend API

```bash
curl http://localhost:3001/health
```

### Тест login через curl

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@casa.kz","password":"admin123"}'
```

## 🎯 Готово!

Теперь можно начинать разработку CRM модулей! 🚀
