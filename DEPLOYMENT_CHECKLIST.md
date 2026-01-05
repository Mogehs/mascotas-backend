# 🚀 Quick Deployment Checklist

Use this checklist when deploying to your Hostinger VPS.

## Pre-Deployment Checklist

- [ ] VPS IP address and SSH credentials ready
- [ ] Domain name configured (DNS A record pointing to VPS IP)
- [ ] Cloudinary account credentials
- [ ] Stripe API keys
- [ ] Firebase service account JSON
- [ ] Gmail app password generated

## Deployment Steps

### 1. Initial Server Setup

```bash
ssh root@your-vps-ip
apt update && apt upgrade -y
apt install -y curl wget git nano ufw
```

### 2. Configure Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 3. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### 4. Install MongoDB

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

### 5. Install PM2 and Nginx

```bash
npm install -g pm2
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 6. Deploy Application

```bash
mkdir -p /var/www/mascotas-backend
cd /var/www/mascotas-backend
git clone https://github.com/Mogehs/mascotas-backend.git .
npm install --production
mkdir -p uploads logs
```

### 7. Configure Environment

```bash
nano /var/www/mascotas-backend/.env
# Copy from env.production.template and fill in your values
```

### 8. Set Permissions

```bash
chown -R www-data:www-data /var/www/mascotas-backend
chmod -R 755 /var/www/mascotas-backend
chmod -R 775 /var/www/mascotas-backend/uploads
```

### 9. Start with PM2

```bash
cd /var/www/mascotas-backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

### 10. Configure Nginx

```bash
nano /etc/nginx/sites-available/mascotas-backend
# Copy from nginx.conf and update domain
ln -s /etc/nginx/sites-available/mascotas-backend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 11. Setup SSL

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

### 12. Verify

```bash
pm2 status
systemctl status nginx
systemctl status mongod
curl https://api.yourdomain.com
```

## Post-Deployment

- [ ] Test API endpoints
- [ ] Update frontend with new API URL
- [ ] Setup MongoDB backups
- [ ] Configure monitoring
- [ ] Test file uploads
- [ ] Test WebSocket connections

## Useful Commands

```bash
# View logs
pm2 logs mascotas-backend
tail -f /var/log/nginx/error.log

# Restart services
pm2 restart mascotas-backend
systemctl restart nginx
systemctl restart mongod

# Update application
cd /var/www/mascotas-backend
git pull
npm install --production
pm2 restart mascotas-backend

# Monitor
pm2 monit
df -h
free -h
```

## Environment Variables Required

```env
PORT=5001
NODE_ENV=production
DATABASE=mongodb://localhost:27017/mascotas-backend
JWT_SECRET_KEY=<generate-strong-secret>
CLOUDINARY_APP_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
SMTP_HOST=smtp.gmail.com
SMTP_MAIL=<your-email@gmail.com>
SMTP_PASSWORD=<gmail-app-password>
SMTP_PORT=587
STRIPE_SECRET_KEY=<your-stripe-key>
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_CLIENT_EMAIL=<firebase-email>
FIREBASE_PRIVATE_KEY=<firebase-private-key>
GOOGLE_API_KEY=<your-google-api-key>
```

## Troubleshooting

### App won't start

```bash
pm2 logs mascotas-backend --lines 50
pm2 restart mascotas-backend
```

### MongoDB connection failed

```bash
systemctl status mongod
systemctl restart mongod
```

### Can't access from outside

```bash
ufw status
nginx -t
systemctl status nginx
```

### File upload errors

```bash
ls -la /var/www/mascotas-backend/uploads
chmod -R 775 /var/www/mascotas-backend/uploads
```
