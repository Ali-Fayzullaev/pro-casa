# 🏠 PRO.casa.kz - Платформа для ипотечных брокеров и застройщиков

## ✨ СИСТЕМА ГОТОВА К ИСПОЛЬЗОВАНИЮ! ✨

Полнофункциональная CRM для недвижимости с управлением клиентами, проектами, шахматкой квартир, бронированием, продажей и разделением ролей (RBAC).

## 🏗️ Структура проекта

```
Pro.casa.kz project/
├── pro-casa/          # Frontend (Next.js + shadcn/ui)
├── backend/           # Backend API (Node.js + Express + Prisma)
├── docker-compose.yml # Docker конфигурация для PostgreSQL
└── README.md          # Этот файл
```

## 🚀 Быстрый старт (Docker)

**Самый простой способ - одна команда:**

```bash
./deploy.sh
```

Этот скрипт:
- Соберет все Docker образы
- Запустит PostgreSQL, Backend и Frontend
- Загрузит тестовые данные
- Покажет статус всех сервисов

### Ручное развертывание

Если хотите запустить вручную:

```bash
# 1. Собрать и запустить все сервисы
docker compose up -d --build

# 2. Подождать пока БД инициализируется (5-10 сек)
sleep 5

# 3. Загрузить тестовые данные
docker exec -i pro-casa-db psql -U pro_casa_user -d pro_casa_db < backend/seed.sql

# 4. Проверить статус
docker compose ps
```

После запуска:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## 🛠️ Разработка без Docker

Если нужно разрабатывать локально:

### 1. Запуск только БД в Docker

```bash
docker compose up -d postgres
```

### 2. Backend локально

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend локально

```bash
cd pro-casa
npm install
npm run dev
```

## 👤 Первый вход

После развертывания системы:

- **Админ**: `admin@casa.kz` / `admin123`

⚠️ **ВАЖНО:** Сразу после первого входа смените пароль администратора!

Админ может создать брокеров и девелоперов через меню "Пользователи".

## 📦 Технологический стек

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation

## 🗄️ База данных

Схема включает:
- **Users** - пользователи системы (админы, брокеры, застройщики)
- **Clients** - клиенты брокеров (CRM)
- **Projects** - жилые комплексы
- **Apartments** - квартиры для шахматки
- **Bookings** - бронирования
- **MortgageCalculations** - расчеты ипотеки
- **ClientDocuments** - документы клиентов

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - вход в систему
- `GET /api/auth/me` - получить текущего пользователя

### Users (только Admin)
- `GET /api/users` - список пользователей
- `POST /api/users` - создать пользователя

### Clients
- `GET /api/clients` - список клиентов
- `POST /api/clients` - создать клиента

### Projects
- `GET /api/projects` - список ЖК
- `POST /api/projects` - создать ЖК

### Apartments
- `GET /api/apartments` - список квартир

### Bookings
- `GET /api/bookings` - список броней

### Mortgage
- `POST /api/mortgage/calculate` - расчет ипотеки

## 🔧 Полезные команды

```bash
# Backend
cd backend
npm run dev              # Запустить dev сервер
npm run build            # Собрать проект
npm run prisma:studio    # Открыть Prisma Studio (GUI для БД)
npm run db:seed          # Заполнить БД тестовыми данными

# Frontend
cd pro-casa
npm run dev              # Запустить dev сервер
npm run build            # Собрать проект
npm run lint             # Проверить код
```

## 📋 План разработки MVP

### ✅ Готово (v1.0)
- [x] Инфраструктура (Docker, БД, Auth)
- [x] Dashboard с реальной статистикой
- [x] CRM модуль (Клиенты)
- [x] Новостройки (Проекты)
- [x] Шахматка квартир
- [x] Бронирование квартир
- [x] Оформление продажи

### ⏳ В планах (v2.0)
- [ ] Ипотечный калькулятор
- [ ] Аналитика и отчеты
- [ ] Управление документами
- [ ] Уведомления (Email/SMS)
- [ ] Telegram бот

**Подробнее см. [MVP-COMPLETE.md](./MVP-COMPLETE.md)**

## 🎨 Дизайн

Минималистичный черно-белый дизайн с использованием shadcn/ui компонентов.

## 📄 Лицензия

Частный проект Casa.kz
