#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PRO.CASA.KZ - Starting All Services ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
    return $?
}

# Kill processes on ports if needed
echo -e "${YELLOW}🔍 Checking for processes on ports...${NC}"
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use. Stopping process...${NC}"
    kill -9 $(lsof -ti:3000) 2>/dev/null
fi

if check_port 3001; then
    echo -e "${YELLOW}⚠️  Port 3001 is in use. Stopping process...${NC}"
    kill -9 $(lsof -ti:3001) 2>/dev/null
fi

echo ""

# Start PostgreSQL with Docker
echo -e "${BLUE}📦 Starting PostgreSQL...${NC}"
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Check PostgreSQL connection
max_attempts=30
attempt=0
until docker exec pro-casa-db pg_isready -U pro_casa_user > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
    echo -ne "${YELLOW}⏳ Attempt $attempt/$max_attempts...${NC}\r"
    sleep 1
done
echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
echo ""

# Setup Backend
echo -e "${BLUE}🔧 Setting up Backend...${NC}"
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Run Prisma migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy

# Generate Prisma client
echo -e "${BLUE}📝 Generating Prisma client...${NC}"
npx prisma generate

# Seed database
echo -e "${BLUE}🌱 Seeding database...${NC}"
npx ts-node prisma/seed.ts || echo -e "${YELLOW}⚠️  Seed data might already exist${NC}"

# Start Backend
echo -e "${BLUE}🚀 Starting Backend server...${NC}"
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

cd ..

# Setup Frontend
echo -e "${BLUE}🎨 Setting up Frontend...${NC}"
cd pro-casa

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start Frontend
echo -e "${BLUE}🚀 Starting Frontend server...${NC}"
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

cd ..

# Wait a bit for servers to start
echo -e "${YELLOW}⏳ Waiting for servers to initialize...${NC}"
sleep 5

# Check if servers are running
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         System Status Check            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check PostgreSQL
if docker ps | grep -q pro-casa-db; then
    echo -e "${GREEN}✅ PostgreSQL: Running${NC}"
    echo -e "   Container: pro-casa-db"
    echo -e "   Port: 5432"
else
    echo -e "${RED}❌ PostgreSQL: Not running${NC}"
fi

# Check Backend
if check_port 3001; then
    echo -e "${GREEN}✅ Backend: Running${NC}"
    echo -e "   URL: http://localhost:3001${NC}"
    echo -e "   PID: $BACKEND_PID"
    echo -e "   Logs: backend.log"
else
    echo -e "${RED}❌ Backend: Not running${NC}"
    echo -e "   Check backend.log for errors"
fi

# Check Frontend
if check_port 3000; then
    echo -e "${GREEN}✅ Frontend: Running${NC}"
    echo -e "   URL: http://localhost:3000${NC}"
    echo -e "   PID: $FRONTEND_PID"
    echo -e "   Logs: frontend.log"
else
    echo -e "${RED}❌ Frontend: Not running${NC}"
    echo -e "   Check frontend.log for errors"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           🎉 All Done! 🎉              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:3001"
echo -e "${GREEN}📊 Prisma Studio:${NC} cd backend && npx prisma studio"
echo ""
echo -e "${YELLOW}👤 Test Users:${NC}"
echo -e "   Admin:     admin@casa.kz     / admin123"
echo -e "   Broker:    broker@casa.kz    / broker123"
echo -e "   Developer: developer@casa.kz / developer123"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Backend:  tail -f backend.log"
echo -e "   Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}🛑 To stop all services:${NC}"
echo -e "   ./stop-all.sh"
echo ""
