#!/bin/bash

# Pull latest changes
git pull origin main

# Rebuild and restart containers
# Using -d for detached mode, --build to force rebuild of images
docker compose up -d --build

# Prune unused images to save space
docker image prune -f

echo "Application updated and restarted."
