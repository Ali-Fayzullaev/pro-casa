# 🚀 Руководство по развертыванию PRO.casa.kz

## 📋 Содержание
1. [Требования](#требования)
2. [Локальная разработка](#локальная-разработка)
3. [Развертывание на сервере](#развертывание-на-сервере)
4. [Безопасность](#безопасность)
5. [Обслуживание](#обслуживание)

---

## ⚙️ Требования

### Минимальные требования к серверу:
- **CPU:** 2 ядра
- **RAM:** 4 GB
- **Диск:** 20 GB SSD
- **OS:** Ubuntu 20.04+ или любой Linux

### Необходимое ПО:
- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn
- Git

---

## 🔧 Локальная разработка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd Pro.casa.kz\ project
```

### 2. Настройка Backend

```bash
cd backend

# Установка зависимостей
npm install

# Копирование .env файла
cp ../.env.example .env

# Редактирование .env (установите свои значения)
nano .env
```

**Важные параметры в .env:**
```env
DATABASE_URL="postgresql://pro_casa_user:your_password@localhost:5432/pro_casa_db"
JWT_SECRET="СГЕНЕРИРУЙТЕ_УНИКАЛЬНЫЙ_КЛЮЧ_32_СИМВОЛА"
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

### 3. Настройка базы данных

```bash
# Запустить PostgreSQL (если не запущен)
sudo systemctl start postgresql

# Создать базу данных
sudo -u postgres psql
CREATE DATABASE pro_casa_db;
CREATE USER pro_casa_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pro_casa_db TO pro_casa_user;
\q

# Применить миграции
npm run prisma:migrate

# Заполнить базу начальными данными (только admin)
npx tsx src/prisma/seed.production.ts
```

### 4. Запуск Backend

```bash
# Development режим
npm run dev

# Production режим
npm run build
npm start
```

Backend будет доступен на `http://localhost:3001`

### 5. Настройка Frontend

```bash
cd ../pro-casa

# Установка зависимостей
npm install

# Создание .env.local (если нужно)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Запуск
npm run dev
```

Frontend будет доступен на `http://localhost:3000`

---

## 🌐 Развертывание на сервере

### Вариант 1: Развертывание на VPS (DigitalOcean, AWS, etc.)

#### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установка Nginx (опционально, для reverse proxy)
sudo apt install -y nginx

# Установка PM2 (для управления процессами)
sudo npm install -g pm2
```

#### 2. Настройка PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE pro_casa_db;
CREATE USER pro_casa_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE pro_casa_db TO pro_casa_user;
\q
```

#### 3. Клонирование и настройка проекта

```bash
# Клонирование
cd /var/www
git clone <repository-url> pro-casa
cd pro-casa

# Backend
cd backend
npm install
cp ../.env.example .env
nano .env  # Настройте DATABASE_URL, JWT_SECRET, NODE_ENV=production

# Миграции и seed
npx prisma migrate deploy
npx tsx src/prisma/seed.production.ts

# Build
npm run build

# Frontend
cd ../pro-casa
npm install
npm run build
```

#### 4. Настройка PM2

```bash
# Backend
cd backend
pm2 start npm --name "pro-casa-backend" -- start
pm2 save
pm2 startup

# Frontend
cd ../pro-casa
pm2 start npm --name "pro-casa-frontend" -- start
pm2 save
```

#### 5. Настройка Nginx (reverse proxy)

```bash
sudo nano /etc/nginx/sites-available/pro-casa
```

```nginx
# Backend
server {
    listen 80;
    server_name api.pro-casa.kz;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name pro-casa.kz www.pro-casa.kz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/pro-casa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL сертификат (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pro-casa.kz -d www.pro-casa.kz -d api.pro-casa.kz
```

---

### Вариант 2: Docker развертывание

#### 1. Создайте docker-compose.production.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: pro_casa_db
      POSTGRES_USER: pro_casa_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pro-casa-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://pro_casa_user:${DB_PASSWORD}@postgres:5432/pro_casa_db
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
    networks:
      - pro-casa-network
    restart: unless-stopped

  frontend:
    build:
      context: ./pro-casa
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
    depends_on:
      - backend
    ports:
      - "80:3000"
    networks:
      - pro-casa-network
    restart: unless-stopped

networks:
  pro-casa-network:
    driver: bridge

volumes:
  postgres_data:
```

#### 2. Запуск

```bash
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔒 Безопасность

### Важные шаги после развертывания:

1. **Смените пароль администратора**
   ```
   Email: admin@casa.kz
   Password: admin123  ← СМЕНИТЬ!
   ```

2. **Генерация JWT_SECRET**
   ```bash
   # Генерация случайного ключа
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Настройте firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Регулярные бэкапы базы данных**
   ```bash
   # Создание cron job для бэкапа
   0 2 * * * pg_dump pro_casa_db > /backups/pro_casa_$(date +\%Y\%m\%d).sql
   ```

5. **Обновите CORS_ORIGIN в .env**
   ```env
   CORS_ORIGIN="https://pro-casa.kz"
   ```

---

## 🔄 Обслуживание

### Обновление приложения

```bash
# Остановка сервисов
pm2 stop all

# Обновление кода
git pull origin main

# Backend
cd backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart pro-casa-backend

# Frontend
cd ../pro-casa
npm install
npm run build
pm2 restart pro-casa-frontend
```

### Мониторинг

```bash
# Просмотр логов
pm2 logs

# Мониторинг
pm2 monit

# Статус
pm2 status
```

### Бэкап базы данных

```bash
# Создание бэкапа
pg_dump -U pro_casa_user pro_casa_db > backup_$(date +%Y%m%d).sql

# Восстановление из бэкапа
psql -U pro_casa_user pro_casa_db < backup_20231123.sql
```

---

## 📊 Мониторинг и логи

### PM2 Dashboard
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Проверка здоровья
```bash
# Backend health check
curl http://localhost:3001/health

# Должен вернуть: {"status":"ok","timestamp":"..."}
```

---

## 🆘 Troubleshooting

### Backend не запускается
```bash
# Проверка логов
pm2 logs pro-casa-backend

# Проверка соединения с БД
psql -U pro_casa_user -d pro_casa_db -h localhost
```

### Frontend показывает ошибки API
```bash
# Проверьте NEXT_PUBLIC_API_URL
cat pro-casa/.env.local

# Проверьте CORS в backend/.env
cat backend/.env | grep CORS
```

### База данных недоступна
```bash
# Проверка статуса PostgreSQL
sudo systemctl status postgresql

# Перезапуск PostgreSQL
sudo systemctl restart postgresql
```

---

## 📞 Поддержка

Для вопросов и поддержки:
- Email: support@casa.kz
- Документация: `/docs` в проекте

---

**Успешного развертывания! 🚀**
