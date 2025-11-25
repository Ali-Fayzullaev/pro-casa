# 🐳 ЗАПУСК ЧЕРЕЗ DOCKER (Правильный способ)

## 🎯 ВАЖНО: Используйте Docker для полной изоляции!

Docker запускает все сервисы (PostgreSQL, Backend, Frontend) в контейнерах.

---

## 📋 ШАГ 1: Остановить все процессы Node.js

Перед запуском Docker убедитесь что никакие процессы не занимают порты:

```bash
# Убить все процессы Node.js
pkill -f node
pkill -f tsx

# Проверить что порты свободны
lsof -ti:3000 3001 5432
# Должно быть пусто!
```

---

## 🏗️ ШАГ 2: Сборка с нуля (первый раз или после изменений)

### Полная пересборка:

```bash
# Перейти в корень проекта
cd "/Users/gibatolla/Pro.casa.kz project"

# Остановить и удалить все контейнеры
docker compose down

# Удалить старые образы (опционально, для чистой сборки)
docker compose down --rmi all --volumes

# Собрать и запустить заново
docker compose up --build -d

# Проверить статус
docker compose ps
```

### Что делает `docker compose up --build -d`:
- `--build` - пересобирает все Docker образы
- `-d` - запускает в фоновом режиме (detached)
- Автоматически создает сеть между контейнерами
- Применяет environment variables из docker-compose.yml

---

## 🚀 ШАГ 3: Запуск (когда уже собрано)

### Если уже собирали, просто запустить:

```bash
cd "/Users/gibatolla/Pro.casa.kz project"

# Запустить все сервисы
docker compose up -d

# Посмотреть логи
docker compose logs -f
```

---

## 📊 ШАГ 4: Применить миграции и seed

### Первый запуск - нужно создать таблицы:

```bash
# Применить миграции Prisma
docker compose exec backend npx prisma migrate deploy

# Создать тестовые данные
docker compose exec backend npx prisma db seed
```

### Или зайти внутрь контейнера:

```bash
# Зайти в backend контейнер
docker compose exec backend sh

# Внутри контейнера:
npx prisma migrate deploy
npm run db:seed
exit
```

---

## ✅ ШАГ 5: Проверка

### Проверить что все контейнеры запущены:

```bash
docker compose ps
```

Должно быть 3 контейнера:
- `pro-casa-db` (postgres) - **Up**
- `pro-casa-backend` (backend) - **Up**
- `pro-casa-frontend` (frontend) - **Up**

### Проверить логи:

```bash
# Все логи
docker compose logs -f

# Только backend
docker compose logs -f backend

# Только frontend
docker compose logs -f frontend

# Только postgres
docker compose logs -f postgres
```

### Проверить доступность:

```bash
# Backend health check
curl http://localhost:3001/health
# Должно вернуть: {"status":"ok"}

# Frontend
open http://localhost:3000
```

---

## 🛑 ОСТАНОВКА

### Остановить все контейнеры:

```bash
# Остановить (контейнеры сохранятся)
docker compose stop

# Остановить и удалить контейнеры
docker compose down

# Остановить + удалить контейнеры + volumes (БД очистится!)
docker compose down --volumes
```

---

## 🔄 ПЕРЕЗАПУСК

### После изменений в коде:

```bash
# Пересобрать и перезапустить
docker compose up --build -d

# Или конкретный сервис
docker compose up --build -d backend
docker compose up --build -d frontend
```

### Без изменений (просто перезапуск):

```bash
docker compose restart

# Или конкретный сервис
docker compose restart backend
docker compose restart frontend
```

---

## 🐛 ОТЛАДКА

### Зайти внутрь контейнера:

```bash
# Backend
docker compose exec backend sh

# Frontend
docker compose exec frontend sh

# PostgreSQL
docker compose exec postgres psql -U pro_casa_user -d pro_casa_db
```

### Посмотреть логи ошибок:

```bash
# Последние 100 строк
docker compose logs --tail=100 backend

# В реальном времени
docker compose logs -f backend
```

### Проверить сеть:

```bash
# Список сетей
docker network ls

# Проверить connectivity
docker compose exec backend ping postgres
docker compose exec frontend ping backend
```

---

## 📁 СТРУКТУРА ПОРТОВ

| Сервис | Внутри Docker | На хосте (Mac) |
|--------|---------------|----------------|
| PostgreSQL | 5432 | 5432 |
| Backend | 3001 | 3001 |
| Frontend | 3000 | 3000 |

---

## 🎯 ПОЛНЫЙ WORKFLOW С НУЛЯ

```bash
# 1. Остановить все процессы
pkill -f node
pkill -f tsx

# 2. Перейти в проект
cd "/Users/gibatolla/Pro.casa.kz project"

# 3. Очистить старые контейнеры
docker compose down --volumes

# 4. Собрать заново
docker compose up --build -d

# 5. Подождать 10 секунд
sleep 10

# 6. Применить миграции
docker compose exec backend npx prisma migrate deploy

# 7. Создать тестовые данные
docker compose exec backend npm run db:seed

# 8. Проверить статус
docker compose ps

# 9. Посмотреть логи
docker compose logs -f

# 10. Открыть браузер
open http://localhost:3000
```

---

## 🆘 ЧАСТЫЕ ПРОБЛЕМЫ

### 1. "Порт уже занят" (EADDRINUSE)

**Причина:** Node.js процесс запущен вне Docker

**Решение:**
```bash
pkill -f node
pkill -f tsx
docker compose down
docker compose up -d
```

### 2. Backend не может подключиться к БД

**Проверить:**
```bash
# Postgres запущен?
docker compose ps postgres

# Логи postgres
docker compose logs postgres

# Проверить подключение
docker compose exec backend ping postgres
```

### 3. Frontend показывает ошибки API

**Проверить:**
```bash
# Backend отвечает?
curl http://localhost:3001/health

# Логи backend
docker compose logs backend

# Environment variables
docker compose exec backend env | grep DATABASE_URL
```

### 4. "no such file or directory: .next/standalone"

**Причина:** Next.js не настроен для standalone режима

**Решение:** Проверить `next.config.ts`:
```typescript
output: 'standalone'
```

### 5. Изменения в коде не применяются

**Решение:**
```bash
# Пересобрать образы
docker compose up --build -d

# Или удалить кеш Docker
docker system prune -a
docker compose up --build -d
```

---

## 💡 СОВЕТЫ

### 1. Используйте алиасы в ~/.zshrc:

```bash
# Добавить в ~/.zshrc
alias dc='docker compose'
alias dcup='docker compose up -d'
alias dcdown='docker compose down'
alias dclogs='docker compose logs -f'
alias dcps='docker compose ps'
alias dcbuild='docker compose up --build -d'
```

После: `source ~/.zshrc`

Теперь можно:
```bash
dcup        # Запустить
dclogs      # Логи
dcdown      # Остановить
dcbuild     # Пересобрать
```

### 2. VS Code Docker Extension

Установите расширение "Docker" в VS Code - можно управлять контейнерами из UI.

### 3. Мониторинг ресурсов

```bash
# Использование ресурсов
docker stats

# Размер образов
docker images

# Очистка неиспользуемых ресурсов
docker system prune
```

---

## ✅ ЧЕКЛИСТ ПЕРЕД РАБОТОЙ

- [ ] Все Node.js процессы остановлены
- [ ] Docker Desktop запущен
- [ ] Порты 3000, 3001, 5432 свободны
- [ ] docker-compose.yml существует
- [ ] Dockerfile есть в backend/ и pro-casa/
- [ ] .env файл настроен (или используются значения из docker-compose.yml)

---

## 🎊 ГОТОВО!

После всех шагов:
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000
- **Prisma Studio:** `docker compose exec backend npx prisma studio`

**Логин:**
- Email: admin@casa.kz
- Password: admin123

---

**Всегда используйте Docker для изолированного окружения! 🐳**
