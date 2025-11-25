# 🚀 ЛОКАЛЬНАЯ РАЗРАБОТКА (Рекомендуется)

## ✅ ЛУЧШИЙ СПОСОБ ДЛЯ РАЗРАБОТКИ

- **PostgreSQL** → Docker (изолирован)
- **Backend** → Локально (npm run dev, горячая перезагрузка)
- **Frontend** → Локально (npm run dev, горячая перезагрузка)

---

## 📋 ШАГ 1: Запустить PostgreSQL в Docker

```bash
# Запустить только PostgreSQL
docker compose up -d postgres

# Проверить что запустился
docker compose ps
# Должен быть: pro-casa-db (Up)

# Посмотреть логи
docker compose logs postgres
```

---

## 📋 ШАГ 2: Применить миграции (ТОЛЬКО ПЕРВЫЙ РАЗ)

```bash
cd backend

# Создать таблицы
npx prisma migrate dev

# Заполнить тестовыми данными
npm run db:seed
```

**Результат:**
```
✅ Admin created: admin@casa.kz
✅ Broker created: broker@casa.kz
✅ Developer created: developer@casa.kz
```

---

## 📋 ШАГ 3: Запустить Backend (Терминал 1)

```bash
cd backend
npm run dev
```

**Должно появиться:**
```
DATABASE_URL: SET
🚀 Server is running on http://localhost:3001
📊 Environment: development
```

Оставьте этот терминал открытым!

---

## 📋 ШАГ 4: Запустить Frontend (Терминал 2)

```bash
cd pro-casa
npm run dev
```

**Должно появиться:**
```
✓ Ready on http://localhost:3000
```

Оставьте этот терминал открытым!

---

## 🌐 ШАГ 5: Открыть в браузере

```
http://localhost:3000
```

**Войти:**
- Email: `admin@casa.kz`
- Password: `admin123`

---

## 🛑 ОСТАНОВКА

### Остановить Backend:
В терминале 1 нажмите: `Ctrl + C`

### Остановить Frontend:
В терминале 2 нажмите: `Ctrl + C`

### Остановить PostgreSQL:
```bash
docker compose stop postgres
```

---

## 🔄 КАЖДЫЙ ДЕНЬ (БЫСТРЫЙ СТАРТ)

```bash
# 1. Запустить PostgreSQL (если не запущен)
docker compose up -d postgres

# 2. Терминал 1: Backend
cd backend
npm run dev

# 3. Терминал 2: Frontend
cd pro-casa
npm run dev

# 4. Открыть http://localhost:3000
```

---

## 🆘 TROUBLESHOOTING

### 1. "Can't reach database server at localhost:5432"

**Решение:**
```bash
# Проверить что PostgreSQL запущен
docker compose ps postgres

# Если нет - запустить
docker compose up -d postgres

# Перезапустить backend
# Ctrl+C в терминале backend
npm run dev
```

### 2. "EADDRINUSE: port 3001 already in use"

**Решение:**
```bash
# Убить процесс
kill -9 $(lsof -ti:3001)

# Запустить снова
npm run dev
```

### 3. "The table public.users does not exist"

**Решение:**
```bash
cd backend
npx prisma migrate dev
npm run db:seed
```

### 4. Backend показывает старый код

**Решение:**
```bash
# Backend использует tsx watch - автоматически перезагружается
# Если не помогает - перезапустите:
# Ctrl+C
npm run dev
```

---

## 💡 ПРЕИМУЩЕСТВА ЭТОГО ПОДХОДА

✅ **Быстрая разработка** - изменения применяются мгновенно  
✅ **Hot reload** - не нужно перезапускать вручную  
✅ **Легко дебажить** - видите все логи в терминале  
✅ **PostgreSQL изолирован** - не мешает другим проектам  
✅ **Не нужно пересобирать Docker** - экономит время  

---

## 📊 ПОРТЫ

| Сервис | Порт |
|--------|------|
| PostgreSQL | 5432 |
| Backend | 3001 |
| Frontend | 3000 |

---

## 🎯 ТЕСТОВЫЕ АККАУНТЫ

После `npm run db:seed`:

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

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ

### Prisma Studio (GUI для БД):
```bash
cd backend
npx prisma studio
# Откроется http://localhost:5555
```

### Пересоздать БД (УДАЛИТ ВСЕ ДАННЫЕ!):
```bash
cd backend
npx prisma migrate reset
npm run db:seed
```

### Посмотреть логи PostgreSQL:
```bash
docker compose logs -f postgres
```

### Перезапустить PostgreSQL:
```bash
docker compose restart postgres
```

---

**Готово! Теперь можно работать! 🎉**
