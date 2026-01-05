#!/bin/bash

# Mascotas Backend Deployment Script for VPS
# This script automates the deployment process

set -e

echo "🚀 Starting Mascotas Backend Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/mascotas-backend"
REPO_URL="https://github.com/Mogehs/mascotas-backend.git"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Node.js 18.x
echo -e "${YELLOW}📦 Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi
echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"
echo -e "${GREEN}✓ NPM version: $(npm -v)${NC}"

# Install MongoDB
echo -e "${YELLOW}📦 Installing MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt update
    apt install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi
echo -e "${GREEN}✓ MongoDB installed and running${NC}"

# Install PM2 globally
echo -e "${YELLOW}📦 Installing PM2...${NC}"
npm install -g pm2

# Install Nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

# Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/uploads
mkdir -p $APP_DIR/logs

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    echo -e "${YELLOW}📥 Updating existing repository...${NC}"
    cd $APP_DIR
    git pull origin main
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Setup environment file
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}⚙️  Creating .env file...${NC}"
    if [ -f "$APP_DIR/env.production.template" ]; then
        cp $APP_DIR/env.production.template $APP_DIR/.env
        echo -e "${RED}⚠️  IMPORTANT: Edit $APP_DIR/.env with your actual credentials${NC}"
    else
        echo -e "${RED}⚠️  WARNING: env.production.template not found${NC}"
    fi
fi

# Set proper permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $APP_DIR/uploads
chmod -R 775 $APP_DIR/logs

# Setup PM2
echo -e "${YELLOW}🔄 Starting application with PM2...${NC}"
cd $APP_DIR
pm2 delete mascotas-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Edit .env file: nano $APP_DIR/.env"
echo "2. Configure Nginx (see nginx.conf)"
echo "3. Setup SSL with Certbot"
echo "4. Restart services: pm2 restart mascotas-backend"
echo ""
echo -e "${GREEN}🎉 Your API should be running on port 5001${NC}"
