#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PRO.CASA.KZ - Stopping All Services ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Stop Frontend
echo -e "${YELLOW}🛑 Stopping Frontend...${NC}"
if lsof -ti:3000 > /dev/null 2>&1; then
    kill -9 $(lsof -ti:3000) 2>/dev/null
    echo -e "${GREEN}✅ Frontend stopped${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend was not running${NC}"
fi

# Stop Backend
echo -e "${YELLOW}🛑 Stopping Backend...${NC}"
if lsof -ti:3001 > /dev/null 2>&1; then
    kill -9 $(lsof -ti:3001) 2>/dev/null
    echo -e "${GREEN}✅ Backend stopped${NC}"
else
    echo -e "${YELLOW}⚠️  Backend was not running${NC}"
fi

# Stop PostgreSQL Docker container
echo -e "${YELLOW}🛑 Stopping PostgreSQL...${NC}"
docker compose down
echo -e "${GREEN}✅ PostgreSQL stopped${NC}"

echo ""
echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo ""
