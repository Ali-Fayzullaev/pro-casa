#!/bin/bash

# Initialize Git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Project setup for deployment"

# Add remote
git remote add origin https://github.com/AGGIB/pro-casa.git

# Rename branch to main
git branch -M main

echo "Git repository initialized and remote added."
echo "To push to GitHub, run: git push -u origin main"
