# 🚀 Rover Dashboard - Quick Start Guide

## Local Development

### First Time Setup
```bash
# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Create SQLite database
touch database/database.sqlite

# Install PHP + Node dependencies
composer install
npm install

# Run migrations and seed data
php artisan migrate:fresh --seed

# Build assets
npm run build

# Start development server
php artisan serve

# In another terminal, watch for changes
npm run dev
```

**Login Credentials (Development):**
- Email: `ham@rover.com` / `mir@rover.com` / `dev@rover.com`
- Password: `password`

### Daily Development

```bash
# Start server
php artisan serve

# Watch for frontend changes (new terminal)
npm run dev

# Run tests
php artisan test
```

## Deployment

### DigitalOcean App Platform (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Create App on DigitalOcean**
   - Visit: https://cloud.digitalocean.com/apps
   - Click "Create App" → Select GitHub → Choose repo
   - Build Command: `composer install && npm install && npm run build:prod`
   - Add MySQL Database (Basic tier)
   - Add Redis Database (Basic tier)
   - Set environment variables (see DEPLOYMENT_DIGITALOCEAN.md)
   - Deploy!

3. **Run Setup After Deploy**
   ```bash
   php artisan migrate --force
   php artisan db:seed --class=DatabaseSeeder
   ```

See **DEPLOYMENT_DIGITALOCEAN.md** for complete guide with all steps and troubleshooting.

## Key Scripts

| Command | Purpose |
|---------|---------|
| `npm run build` | Build with wayfinder (local dev) |
| `npm run build:prod` | Build for production (skips wayfinder) |
| `php artisan serve` | Run development server |
| `npm run dev` | Watch frontend changes |
| `php artisan test` | Run all tests |
| `php artisan migrate` | Run database migrations |
| `php artisan db:seed` | Seed test data |
| `php artisan tinker` | Interactive shell |

## Project Structure

```
rover-dashboard/
├── app/                          # Laravel backend
│   ├── Http/Controllers/         # Route handlers
│   ├── Models/                   # Database models
│   └── Providers/                # Service providers
├── resources/
│   ├── js/                       # React + TypeScript
│   │   ├── components/           # Reusable UI components
│   │   │   ├── rover/            # Rover-specific components
│   │   │   └── sidebar/          # Sidebar components
│   │   ├── pages/                # Full page components
│   │   └── types/                # TypeScript definitions
│   └── css/                      # Tailwind CSS
├── database/
│   ├── migrations/               # Database schemas
│   └── seeders/                  # Test data
├── public/                       # Web root
├── routes/                       # URL routes
├── tests/                        # Unit & feature tests
├── app.json                      # DigitalOcean config ✨
├── Procfile                      # Process definition ✨
├── nginx_app.conf                # Nginx configuration ✨
├── vite.config.ts                # Vite build config
└── composer.json / package.json  # Dependencies
```

✨ = New files for DigitalOcean deployment

## Features

✅ **Real-time Dashboard**
- Radial gauges for telemetry metrics
- Compass visualization
- Sparkline charts
- Signal strength indicator
- Battery & temperature displays
- GPS navigation display

✅ **Authentication**
- Login restricted to 3 authorized users
- Two-factor authentication support
- Email verification

✅ **Setup Guide**
- Interactive 8-step Raspberry Pi setup
- Terminal command copy functionality
- Accessible in sidebar

✅ **Responsive Design**
- Mobile-friendly UI
- Dark mode support
- Tailwind CSS 4

✅ **Testing**
- 4+ passing tests
- Feature & unit tests
- Dashboard telemetry tests

## Important Files for Deployment

- **`.env`** - Configuration (create from `.env.example`)
- **`app.json`** - Specifies PHP runs before Node (fixes build issue)
- **`Procfile`** - Tells DigitalOcean how to run the app
- **`nginx_app.conf`** - Nginx server configuration
- **`vite.config.ts`** - Conditionally disables wayfinder if PHP unavailable

## Troubleshooting

### Local Build Issues
```bash
# Clear caches
php artisan cache:clear
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Authentication Not Working
- Verify email is one of: `ham@rover.com`, `mir@rover.com`, `dev@rover.com`
- Check password is exactly: `password`
- View logs: `tail -f storage/logs/laravel.log`

### Database Errors
```bash
# Reset database (development only)
php artisan migrate:fresh --seed

# Verify connection
php artisan tinker
> DB::connection()->getPDO()
```

### Frontend Not Updating
```bash
# Clear Laravel cache
php artisan cache:clear
php artisan config:clear

# Rebuild frontend
npm run build
```

### Tests Failing
```bash
# Run with verbose output
php artisan test --verbose

# Run specific test
php artisan test tests/Feature/DashboardTest.php
```

## Deployment Checklist

Before deploying to DigitalOcean:

- [ ] Code pushed to GitHub
- [ ] `.env.example` has correct defaults
- [ ] Local tests pass: `php artisan test`
- [ ] Local build succeeds: `npm run build:prod`
- [ ] Database credentials ready
- [ ] Redis connection details ready
- [ ] Domain name configured
- [ ] SSL certificate ready (auto via Let's Encrypt)

## First Deploy Quick Steps

```bash
# 1. Ensure code is pushed
git push origin main

# 2. Create app on DigitalOcean (see DEPLOYMENT_DIGITALOCEAN.md)
# 3. Add databases and environment variables
# 4. Deploy from dashboard
# 5. After build completes, run in console:
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder

# 6. Visit your app URL and login!
```

## Production Best Practices

1. **Change Default Passwords**
   ```bash
   php artisan tinker
   > User::all()->each(fn($u) => $u->update(['password' => Hash::make('strong-password')]))
   ```

2. **Set Strong Environment Variables**
   - Use 32+ character random strings for keys
   - Use unique database password
   - Use unique Redis password

3. **Enable Backups**
   - DigitalOcean offers automatic database backups
   - Configure in Managed Databases section

4. **Monitor Logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```

5. **Keep Dependencies Updated**
   ```bash
   composer update
   npm update
   ```

---

**Ready to deploy?** See **DEPLOYMENT_DIGITALOCEAN.md** for complete instructions.

Questions? Check the logs: `storage/logs/laravel.log`
