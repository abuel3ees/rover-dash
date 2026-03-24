# 🚀 Rover Dashboard - DigitalOcean Deployment Guide

## Overview

Your Rover Dashboard is now ready for production deployment on DigitalOcean. The build pipeline has been optimized to handle the platform's buildpack execution order (PHP runs AFTER Node).

## Quick Deploy (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial Rover Dashboard commit"

# Create main branch
git branch -M main

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/rover-dashboard.git

# Push
git push -u origin main
```

### Step 2: Create DigitalOcean App

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Select **"GitHub"** as source
4. Choose your `rover-dashboard` repository
5. Select **main** branch
6. Click **"Next"**

### Step 3: Configure Build Settings

In the "Build and Deploy" section:

- **Build Command**: `composer install && npm install && npm run build:prod`
- **Output Directory**: `public`
- **HTTP Port**: `8080`

Click **"Next"**

### Step 4: Add Environment Variables

Add these variables in the "Environment" section (copy from below and replace placeholders):

```env
# Application
APP_NAME=Rover Dashboard
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app-name.ondigitalocean.app
APP_KEY=base64:YOUR_GENERATED_KEY_HERE

# Database (will create in next step)
DB_CONNECTION=mysql
DB_HOST=db-mysql-your-cluster.ondigitalocean.com
DB_PORT=3306
DB_DATABASE=rover_dashboard
DB_USERNAME=doadmin
DB_PASSWORD=YOUR_DB_PASSWORD

# Cache & Queue
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=database

# Redis (will create in next step)
REDIS_HOST=redis-your-cluster.ondigitalocean.com
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_PORT=25061

# Mail (optional, for notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM_ADDRESS=noreply@rover-dashboard.com

# Fortify (authentication)
FORTIFY_FEATURES=profile,security
```

Click **"Next"**

### Step 5: Add Database Component

1. Click **"Create Resources"** or **"Add"**
2. Select **"MySQL Database"**
3. Configure:
   - **Name**: `db`
   - **Cluster Name**: `rover-dashboard-db`
   - **Version**: `8.0`
   - **Tier**: **Basic** (1 GB / 1 vCPU) - sufficient for testing
   - **Region**: Same as your app

4. Click **"Create Database"**

The connection details will appear. Copy `host`, `port`, `username`, `password` into your environment variables above.

### Step 6: Add Redis Component

1. Click **"Add"** again
2. Select **"Redis Database"**
3. Configure:
   - **Name**: `redis`
   - **Cluster Name**: `rover-dashboard-cache`
   - **Version**: Latest
   - **Tier**: **Basic** (1 GB)
   - **Region**: Same as your app

4. Click **"Create Database"**

Copy connection details to environment variables above.

### Step 7: Review & Deploy

1. Review all settings
2. Click **"Deploy App"**
3. Wait for build to complete (typically 3-5 minutes)

**Build Pipeline Order:**
1. ✅ PHP buildpack installs (composer install)
2. ✅ Node buildpack installs (npm install)
3. ✅ Production build runs (`npm run build:prod` - skips wayfinder)
4. ✅ App starts with Nginx + PHP-FPM

### Step 8: Run Initial Setup

Once deployed, run migrations and seed data:

1. Go to your app in DigitalOcean dashboard
2. Click **"Console"** tab
3. Run:

```bash
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder
```

This creates the database schema and seeds 3 test users:
- `ham@rover.com` / `password`
- `mir@rover.com` / `password`
- `dev@rover.com` / `password`

**⚠️ Change these passwords in production!**

## Manual Droplet Setup (Alternative)

If you prefer a traditional VPS setup:

### Prerequisites
- DigitalOcean Droplet (2GB RAM minimum, Ubuntu 22.04 LTS recommended)
- Domain name configured to point to Droplet IP
- SSH access to Droplet

### Setup Steps

```bash
# Connect to droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install PHP 8.2 and extensions
apt install -y php8.2-fpm php8.2-mysql php8.2-redis php8.2-curl php8.2-xml php8.2-mbstring php8.2-zip

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install MySQL
apt install -y mysql-server
mysql_secure_installation

# Clone your repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/rover-dashboard.git
cd rover-dashboard

# Set permissions
chown -R www-data:www-data .
chmod -R 755 .

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install --production
npm run build:prod

# Setup .env file
cp .env.example .env
# Edit with your values
nano .env

# Generate key
php artisan key:generate

# Create database
mysql -u root -p <<EOF
CREATE DATABASE rover_dashboard;
CREATE USER 'rover_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON rover_dashboard.* TO 'rover_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Run migrations and seeding
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder

# Create storage symlink
php artisan storage:link

# Configure Nginx
cat > /etc/nginx/sites-available/rover-dashboard <<'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/rover-dashboard/public;
    index index.php;

    # Increase upload limit
    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/rover-dashboard /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Install SSL certificate (Let's Encrypt)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com

# Create Laravel queue worker service
sudo tee /etc/systemd/system/rover-queue.service > /dev/null <<EOF
[Unit]
Description=Rover Dashboard Queue
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/rover-dashboard
ExecStart=/usr/bin/php artisan queue:work redis --sleep=3 --tries=3
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=rover-queue

[Install]
WantedBy=multi-user.target
EOF

# Enable queue worker
systemctl daemon-reload
systemctl enable rover-queue
systemctl start rover-queue

# Setup cron for scheduled tasks
(crontab -l 2>/dev/null; echo "* * * * * /usr/bin/php /var/www/rover-dashboard/artisan schedule:run >> /dev/null 2>&1") | crontab -

# Restart PHP-FPM
systemctl restart php8.2-fpm
```

## Post-Deployment Tasks

### 1. Verify Installation

```bash
# Test database connection
php artisan tinker
> DB::connection()->getPDO()
# Should return a PDOConnection object

# Check queue
php artisan queue:failed

# View logs
tail -f storage/logs/laravel.log
```

### 2. Change Default Passwords

```bash
php artisan tinker

# For each user, set a strong password:
> $user = App\Models\User::where('email', 'ham@rover.com')->first()
> $user->password = Hash::make('your-strong-password')
> $user->save()
```

### 3. Configure Backups

```bash
# Setup automatic daily backups
mysqldump -u rover_user -p rover_dashboard > /var/www/rover-dashboard/backups/backup-$(date +\%Y\%m\%d).sql

# Add to crontab for daily 2 AM backups
0 2 * * * mysqldump -u rover_user -pYOUR_PASSWORD rover_dashboard > /var/www/rover-dashboard/backups/backup-$(date +\%Y\%m\%d).sql
```

### 4. Setup Monitoring

```bash
# Monitor app health
curl https://your-domain.com/health

# Check queue status
php artisan queue:failed
php artisan queue:retry all
```

## Troubleshooting

### Build Error: "php: not found"
✅ **Already fixed!** Your build uses `npm run build:prod` which sets `SKIP_WAYFINDER=true`, allowing the build to complete even without PHP during the Node buildpack phase.

### Database Connection Error
```bash
# Check MySQL is running
systemctl status mysql

# Test connection manually
mysql -u rover_user -p rover_dashboard

# Verify .env has correct credentials
cat .env | grep DB_
```

### Assets Not Loading (404 errors)
```bash
# Rebuild assets
npm run build:prod

# Ensure public directory is correct
ls -la public/build/
```

### Permission Denied Errors
```bash
# Reset permissions
chown -R www-data:www-data /var/www/rover-dashboard
chmod -R 755 /var/www/rover-dashboard
chmod -R 775 /var/www/rover-dashboard/storage
chmod -R 775 /var/www/rover-dashboard/bootstrap/cache
```

### Queue Not Processing
```bash
# Check queue worker status
systemctl status rover-queue

# Restart if needed
systemctl restart rover-queue

# View logs
journalctl -u rover-queue -n 50 --no-pager
```

### SSL Certificate Issues
```bash
# Renew certificate
certbot renew

# Force renewal
certbot renew --force-renewal
```

## Monitoring & Maintenance

### Regular Checks

```bash
# Database size
mysql -u rover_user -p -e "SELECT TABLE_SCHEMA AS 'Database', ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)' FROM INFORMATION_SCHEMA.TABLES GROUP BY TABLE_SCHEMA;"

# Disk usage
df -h

# Memory usage
free -h

# Queue status
php artisan queue:failed
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
composer install --no-dev
npm install --production
npm run build:prod

# Run migrations
php artisan migrate --force

# Clear cache
php artisan cache:clear
php artisan config:clear

# Restart queue
systemctl restart rover-queue
```

## Performance Tips

1. **Enable Query Caching**
   ```php
   // config/database.php
   'cache' => env('DB_CACHE', true),
   ```

2. **Use Redis for Sessions**
   - Already configured in `.env` as `SESSION_DRIVER=redis`

3. **Enable Gzip Compression**
   ```nginx
   # Add to nginx config
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

4. **Setup CDN** (optional)
   - Use DigitalOcean Spaces for static assets
   - Configure in `config/filesystems.php`

## Security Checklist

- [x] Change default passwords
- [x] Enable HTTPS (SSL certificate)
- [x] Set `APP_DEBUG=false`
- [x] Use strong database password
- [x] Configure firewall rules
- [x] Setup backups
- [x] Monitor logs
- [x] Keep dependencies updated

## Support

For issues or questions:

1. Check `storage/logs/laravel.log`
2. Review DigitalOcean app logs
3. Test locally with `php artisan serve`
4. Verify environment variables match `.env.example`

---

**Your Rover Dashboard is now deployed! 🚀**

Access it at: `https://your-app-name.ondigitalocean.app`
