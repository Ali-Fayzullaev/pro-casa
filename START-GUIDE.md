# 🚀 ИНСТРУКЦИЯ ПО ЗАПУСКУ PRO.CASA.KZ

## 📋 ПОЛНАЯ ИНСТРУКЦИЯ (ПОШАГОВО)

---

## 1️⃣ ПЕРВЫЙ ЗАПУСК (только один раз)

### Шаг 1: Подготовка Backend

```bash
# Перейти в папку backend
cd backend

# Установить зависимости
npm install

# Проверить что DATABASE_URL настроен
cat .env | grep DATABASE_URL
```

### Шаг 2: База данных

```bash
# Применить миграции (создать таблицы)
npx prisma migrate dev

# Создать тестовые данные (admin, broker, developer)
npm run db:seed

# Или для production (только admin)
npm run db:seed:production
```

### Шаг 3: Подготовка Frontend

```bash
# Перейти в папку frontend
cd ../pro-casa

# Установить зависимости
npm install
```

---

## 2️⃣ КАЖДЫЙ ДЕНЬ (запуск для работы)

### ⚡ БЫСТРЫЙ СПОСОБ (рекомендуется)

Откройте **2 терминала**:

#### Терминал 1 - Backend:
```bash
cd backend
npm run dev
```

Должно появиться:
```
✅ Database connected
🚀 Server running on http://localhost:3001
```

#### Терминал 2 - Frontend:
```bash
cd pro-casa
npm run dev
```

Должно появиться:
```
✓ Ready on http://localhost:3000
```

### 🌐 Откройте браузер:
```
http://localhost:3000
```

---

## 🔴 ЕСЛИ ОШИБКА: "Порт занят"

### Ошибка выглядит так:
```
Error: listen EADDRINUSE: address already in use :::3001
```

### Решение:

**Способ 1: Найти и убить процесс (быстро)**
```bash
# Найти процесс на порту 3001
lsof -ti:3001

# Убить процесс (замените PID на число из предыдущей команды)
kill -9 <PID>

# Или одной командой:
kill -9 $(lsof -ti:3001)

# Проверить что порт свободен
lsof -ti:3001
# (должно быть пусто)

# Запустить снова
npm run dev
```

**Способ 2: Убить все Node.js процессы**
```bash
pkill -f node

# Подождать 2 секунды
sleep 2

# Запустить снова
npm run dev
```

---

## 3️⃣ ПРОВЕРКА ЧТО ВСЁ РАБОТАЕТ

### Backend (API):
```bash
curl http://localhost:3001/health
```
Должно вернуть: `{"status":"ok"}`

### Frontend:
Откройте в браузере: `http://localhost:3000`

Должна появиться страница входа.

---

## 4️⃣ ВХОД В СИСТЕМУ

### Тестовые аккаунты (после db:seed):

**Администратор:**
```
Email: admin@casa.kz
Password: admin123
```

**Брокер:**
```
Email: broker@casa.kz
Password: broker123
```

**Девелопер:**
```
Email: developer@casa.kz
Password: developer123
```

---

## 5️⃣ ОСТАНОВКА СЕРВЕРОВ

### Способ 1: В терминале нажмите:
```
Ctrl + C
```

### Способ 2: Закрыть окно терминала

### Способ 3: Убить все процессы Node:
```bash
pkill -f node
```

---

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ

### Backend:

```bash
cd backend

# Запуск dev сервера
npm run dev

# Просмотр базы данных (GUI)
npx prisma studio
# Откроется http://localhost:5555

# Пересоздать базу (УДАЛИТ ВСЕ ДАННЫЕ!)
npx prisma migrate reset

# Заполнить тестовыми данными
npm run db:seed
```

### Frontend:

```bash
cd pro-casa

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Проверка кода
npm run lint
```

---

## 📊 СТРУКТУРА ПОРТОВ

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`
- **Prisma Studio:** `http://localhost:5555` (если запущен)
- **PostgreSQL:** `localhost:5432` (внутри системы)

---

## ⚠️ ЧАСТЫЕ ПРОБЛЕМЫ

### 1. Backend не запускается - "Порт занят"
**Решение:** 
```bash
kill -9 $(lsof -ti:3001)
npm run dev
```

### 2. Frontend не запускается - "Порт 3000 занят"
**Решение:**
```bash
kill -9 $(lsof -ti:3000)
npm run dev
```

### 3. База данных не подключается
**Решение:**
```bash
# Проверить PostgreSQL запущен
brew services list | grep postgresql

# Запустить PostgreSQL
brew services start postgresql
```

### 4. "DATABASE_URL is not set"
**Решение:**
```bash
# Проверить .env файл существует
cat backend/.env

# Если нет - создать из примера
cp .env.example backend/.env
nano backend/.env
```

### 5. Ошибки Prisma
**Решение:**
```bash
cd backend

# Регенерировать клиент
npx prisma generate

# Применить миграции
npx prisma migrate dev
```

---

## 🎯 ЧЕКЛИСТ ПЕРЕД РАБОТОЙ

- [ ] PostgreSQL запущен
- [ ] Backend/.env настроен
- [ ] Backend зависимости установлены (`npm install`)
- [ ] Frontend зависимости установлены (`npm install`)
- [ ] Миграции применены (`prisma migrate dev`)
- [ ] Тестовые данные загружены (`npm run db:seed`)
- [ ] Порты 3000 и 3001 свободны

---

## 🚀 ИДЕАЛЬНЫЙ ПРОЦЕСС ЗАПУСКА

### Каждый день делайте так:

1. **Откройте терминал 1:**
   ```bash
   cd /Users/gibatolla/Pro.casa.kz\ project/backend
   npm run dev
   ```
   Ждите сообщение: `✅ Server running on http://localhost:3001`

2. **Откройте терминал 2:**
   ```bash
   cd /Users/gibatolla/Pro.casa.kz\ project/pro-casa
   npm run dev
   ```
   Ждите сообщение: `✓ Ready on http://localhost:3000`

3. **Откройте браузер:**
   ```
   http://localhost:3000
   ```

4. **Войдите:**
   - Email: `admin@casa.kz`
   - Password: `admin123`

5. **Работайте!** 🎉

---

## 💡 СОВЕТЫ

### Совет 1: Используйте разные окна терминала
Держите backend и frontend в разных окнах - так удобнее видеть логи.

### Совет 2: Оставляйте терминалы открытыми
Не закрывайте терминалы пока работаете - серверы должны работать постоянно.

### Совет 3: Смотрите на логи
Если что-то не работает - смотрите на сообщения в терминале.

### Совет 4: Prisma Studio
Для просмотра базы данных запустите:
```bash
cd backend
npx prisma studio
```

---

## 📞 Если ничего не помогло

1. Убейте все процессы: `pkill -f node`
2. Закройте все терминалы
3. Перезапустите PostgreSQL: `brew services restart postgresql`
4. Подождите 5 секунд
5. Запустите заново по инструкции выше

---

**Успешной работы! 🚀**
