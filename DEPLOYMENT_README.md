# Deployment Files Overview

This directory contains all the necessary files for deploying the Mascotas Backend to a Hostinger VPS.

## 📁 Files Included

### 1. **VPS_DEPLOYMENT_GUIDE.md** (Main Guide)

Complete step-by-step guide for deploying to VPS from scratch. This is your primary resource.

**What it covers:**

- Initial server setup
- Installing Node.js, MongoDB, PM2, Nginx
- Deploying the application
- Configuring SSL/HTTPS
- Security best practices
- Troubleshooting

**Start here if:** You're deploying for the first time or need detailed explanations.

---

### 2. **DEPLOYMENT_CHECKLIST.md** (Quick Reference)

Condensed checklist with essential commands.

**What it covers:**

- Quick deployment steps
- Essential commands
- Environment variables list
- Common troubleshooting

**Start here if:** You've deployed before and just need a quick reference.

---

### 3. **ecosystem.config.js** (PM2 Configuration)

Process manager configuration for keeping your app running.

**Usage:**

```bash
pm2 start ecosystem.config.js
```

**What it does:**

- Configures app name and script
- Sets up logging
- Manages auto-restart
- Defines environment variables

---

### 4. **nginx.conf** (Nginx Configuration)

Reverse proxy configuration for serving your API.

**Usage:**

```bash
# Copy to Nginx sites-available
sudo cp nginx.conf /etc/nginx/sites-available/mascotas-backend

# Enable the site
sudo ln -s /etc/nginx/sites-available/mascotas-backend /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

**What it does:**

- Routes traffic from port 80/443 to your app (port 5001)
- Handles SSL/HTTPS
- Supports WebSocket connections (Socket.io)
- Serves uploaded files
- Adds security headers

---

### 5. **env.production.template** (Environment Variables)

Template for your production environment configuration.

**Usage:**

```bash
# Copy to .env
cp env.production.template .env

# Edit with your credentials
nano .env
```

**What it contains:**

- Server configuration
- MongoDB connection string
- JWT secret
- Cloudinary credentials
- Email (SMTP) settings
- Stripe API keys
- Firebase configuration
- Google API key

---

### 6. **deploy.sh** (Automated Deployment Script)

Bash script that automates the entire deployment process.

**Usage:**

```bash
# Make executable
chmod +x deploy.sh

# Run as root
sudo ./deploy.sh
```

**What it does:**

- Updates system packages
- Installs Node.js, MongoDB, PM2, Nginx
- Clones your repository
- Sets up directories and permissions
- Starts the application

**⚠️ Note:** Review the script before running. You'll still need to manually configure the .env file.

---

## 🚀 Quick Start

### First Time Deployment

1. **Read the main guide:**

   ```bash
   # Open VPS_DEPLOYMENT_GUIDE.md
   ```

2. **Connect to your VPS:**

   ```bash
   ssh root@your-vps-ip
   ```

3. **Follow the guide step by step** or use the automated script:

   ```bash
   # Upload deploy.sh to your VPS
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

4. **Configure environment:**

   ```bash
   cd /var/www/mascotas-backend
   cp env.production.template .env
   nano .env  # Fill in your credentials
   ```

5. **Start the app:**

   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

6. **Configure Nginx:**

   ```bash
   cp nginx.conf /etc/nginx/sites-available/mascotas-backend
   ln -s /etc/nginx/sites-available/mascotas-backend /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

7. **Setup SSL:**
   ```bash
   certbot --nginx -d api.yourdomain.com
   ```

---

## 🔄 Updating Your Application

When you push new code:

```bash
ssh root@your-vps-ip
cd /var/www/mascotas-backend
git pull origin main
npm install --production
pm2 restart mascotas-backend
```

---

## 📊 Monitoring

```bash
# Check app status
pm2 status

# View logs
pm2 logs mascotas-backend

# Monitor resources
pm2 monit
```

---

## 🆘 Troubleshooting

If something goes wrong:

1. **Check logs:**

   ```bash
   pm2 logs mascotas-backend --lines 50
   tail -f /var/log/nginx/error.log
   ```

2. **Verify services:**

   ```bash
   systemctl status mongod
   systemctl status nginx
   pm2 status
   ```

3. **Restart services:**

   ```bash
   pm2 restart mascotas-backend
   systemctl restart nginx
   systemctl restart mongod
   ```

4. **Check the troubleshooting section** in VPS_DEPLOYMENT_GUIDE.md

---

## 🔐 Security Checklist

After deployment:

- [ ] Change default SSH port
- [ ] Disable root login
- [ ] Setup firewall (UFW)
- [ ] Install Fail2Ban
- [ ] Setup SSL certificate
- [ ] Use strong passwords
- [ ] Enable MongoDB authentication
- [ ] Regular system updates

---

## 📝 Important Notes

### File Uploads

Images are stored locally on the VPS in `/var/www/mascotas-backend/uploads/`

### MongoDB

MongoDB runs locally on the VPS. Connection string: `mongodb://localhost:27017/mascotas-backend`

### Ports

- **App:** 5001 (internal)
- **HTTP:** 80 (Nginx)
- **HTTPS:** 443 (Nginx)
- **MongoDB:** 27017 (localhost only)

### Logs Location

- **PM2 Logs:** `/var/www/mascotas-backend/logs/`
- **Nginx Logs:** `/var/log/nginx/`
- **MongoDB Logs:** `/var/log/mongodb/`

---

## 🎯 What You Need Before Starting

1. **VPS Access:**

   - IP address
   - Root password or SSH key

2. **Domain Name (Optional but Recommended):**

   - DNS A record pointing to VPS IP

3. **Third-Party Services:**
   - Cloudinary account (for image optimization)
   - Stripe account (for payments)
   - Firebase project (for push notifications)
   - Gmail with App Password (for emails)

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section in the main guide
2. Review the logs
3. Verify all environment variables are set correctly
4. Ensure all services are running

---

**Good luck with your deployment! 🚀**
