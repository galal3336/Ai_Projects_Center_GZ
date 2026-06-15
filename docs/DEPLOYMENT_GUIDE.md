# AIKFS — Deployment Guide

> Stack: Laravel 12 + Inertia/React + MySQL 8.4 + Redis 7.4 + Nginx + Supervisor
> Runtime: PHP 8.3-FPM (Alpine), multi-stage Docker build, Docker Compose v2

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [First-Time Server Setup](#2-first-time-server-setup)
3. [Project Setup](#3-project-setup)
4. [Environment Configuration](#4-environment-configuration)
5. [SSL / TLS with Certbot](#5-ssl--tls-with-certbot)
6. [Nginx WebSocket Proxy](#6-nginx-websocket-proxy-reverb)
7. [First Deployment](#7-first-deployment)
8. [Seeding Initial Data](#8-seeding-initial-data)
9. [Zero-Downtime Deployments](#9-zero-downtime-deployments)
10. [Rollback Procedure](#10-rollback-procedure)
11. [Container Management Cheatsheet](#11-container-management-cheatsheet)

---

## 1. Prerequisites

| Requirement        | Minimum          | Recommended      |
|--------------------|------------------|------------------|
| OS                 | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| CPU                | 2 vCPU           | 4 vCPU           |
| RAM                | 4 GB             | 8 GB             |
| Disk               | 40 GB SSD        | 80 GB SSD        |
| Docker             | 27.x             | latest stable    |
| Docker Compose     | v2.x             | latest stable    |
| Domain             | Required         | With www alias   |
| SMTP provider      | Required         | Resend / SES     |
| Anthropic API key  | Required         | —                |

---

## 2. First-Time Server Setup

### 2a. System Packages

```bash
# Update and install dependencies
apt update && apt upgrade -y
apt install -y curl git unzip htop ufw fail2ban logrotate certbot

# Install Docker
curl -fsSL https://get.docker.com | bash
usermod -aG docker $USER     # replace $USER with your deploy user
newgrp docker
docker --version             # should show Docker 27+
docker compose version       # should show Docker Compose v2+
```

### 2b. Firewall (UFW)

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirect to HTTPS)
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

### 2c. Swap (important for < 8 GB RAM)

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
swapon --show
```

### 2d. Fail2ban (brute-force protection)

```bash
systemctl enable fail2ban
systemctl start fail2ban
# SSH protection is enabled by default
```

### 2e. Log rotation for Docker

```bash
cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "5"
  }
}
EOF
systemctl restart docker
```

---

## 3. Project Setup

```bash
# Create deployment directory
mkdir -p /var/www/aikfs
cd /var/www/aikfs

# Clone repository
git clone https://github.com/your-org/aikfs.git .

# Create backups directory
mkdir -p /backups/aikfs/db /backups/aikfs/storage
chmod +x docker/backup.sh
```

---

## 4. Environment Configuration

```bash
# Copy the production template
cp .env.production .env

# Open and fill ALL values
nano .env
```

### Required Values to Fill

```bash
# Generate APP_KEY
php artisan key:generate --show
# Paste the output as APP_KEY=base64:...

# Generate Reverb keys (run locally or in a temp container)
docker run --rm php:8.3-cli bash -c "
  composer create-project laravel/laravel tmp --quiet &&
  cd tmp && php artisan reverb:install 2>&1 | grep -E 'APP_(ID|KEY|SECRET)'
"
```

### Final Checklist Before Deploying

```bash
# Confirm no CHANGE_ME_ strings remain
grep "CHANGE_ME" .env && echo "DANGER: unfilled variables!" || echo "OK: all filled"

# Confirm APP_DEBUG is false
grep "APP_DEBUG" .env
# Expected: APP_DEBUG=false

# Confirm APP_ENV is production
grep "APP_ENV" .env
# Expected: APP_ENV=production
```

---

## 5. SSL / TLS with Certbot

### 5a. Obtain Certificate

```bash
# Stop anything on port 80 first
systemctl stop nginx 2>/dev/null || true

certbot certonly \
  --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email admin@your-domain.com \
  --agree-tos \
  --no-eff-email
```

Certificates are placed at:
- Certificate: `/etc/letsencrypt/live/your-domain.com/fullchain.pem`
- Private key: `/etc/letsencrypt/live/your-domain.com/privkey.pem`

### 5b. Update Nginx Config to Use SSL

Edit `docker/nginx/default.conf` to add HTTPS:

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2  on;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache   shared:SSL:10m;
    ssl_stapling        on;
    ssl_stapling_verify on;

    # ... rest of existing config (root, headers, locations) ...
}
```

Mount the Let's Encrypt directory into the container by adding to `docker-compose.yml` under `app.volumes`:

```yaml
volumes:
  - app_storage:/var/www/html/storage/app
  - app_logs:/var/www/html/storage/logs
  - /etc/letsencrypt:/etc/letsencrypt:ro   # add this line
```

### 5c. Certificate Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Cron for renewal (runs twice daily, standard Certbot practice)
# Certbot installs a systemd timer automatically on Ubuntu:
systemctl status certbot.timer

# After renewal, reload Nginx inside container:
cat > /etc/cron.d/certbot-reload <<'EOF'
0 0,12 * * * root certbot renew --quiet && docker compose -f /var/www/aikfs/docker-compose.yml exec -T app nginx -s reload
EOF
```

---

## 6. Nginx WebSocket Proxy (Reverb)

Reverb listens on port 8080 inside the container. Add this location block to `docker/nginx/default.conf` inside the SSL server block:

```nginx
# WebSocket proxy for Laravel Reverb
location /app/ {
    proxy_pass         http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "Upgrade";
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

In `.env` set `REVERB_PORT=443` and `REVERB_SCHEME=https` so the frontend client connects over WSS on port 443.

---

## 7. First Deployment

```bash
cd /var/www/aikfs

# Step 1 — Build image (takes ~3-5 minutes on first run)
docker compose build --no-cache

# Step 2 — Start all services
docker compose up -d

# Step 3 — Watch startup logs
docker compose logs -f --tail=100

# Step 4 — Wait for health checks to pass (~60 seconds)
watch docker compose ps

# Step 5 — Verify the app is healthy
curl -sf http://localhost/up && echo "HEALTHY" || echo "UNHEALTHY"

# Step 6 — Verify all supervisor processes
docker compose exec app supervisorctl status

# Expected output:
# nginx                            RUNNING   pid ...
# php-fpm                          RUNNING   pid ...
# queue-cache:queue-cache_00       RUNNING   pid ...
# queue-default:queue-default_00   RUNNING   pid ...
# queue-default:queue-default_01   RUNNING   pid ...
# queue-notifications:...          RUNNING   pid ...
# reverb                           RUNNING   pid ...
```

---

## 8. Seeding Initial Data

Run seeder only on first deployment to avoid duplicate data:

```bash
# Check if data already exists before seeding
docker compose exec app php artisan tinker --execute="echo App\Models\User::count();"

# If count is 0, seed:
docker compose exec app php artisan db:seed --force

# Verify seed created super_admin user
docker compose exec app php artisan tinker --execute="echo App\Models\User::first()->email;"
```

---

## 9. Zero-Downtime Deployments

The entrypoint runs `migrate --force` on startup. Follow this sequence to deploy updates with minimal downtime (~30 seconds restart time):

```bash
cd /var/www/aikfs

# Step 1 — Pull latest code
git pull origin main

# Step 2 — Rebuild image (only rebuilds changed layers)
docker compose build app

# Step 3 — Enable maintenance mode (stored in Redis, so all instances see it)
docker compose exec app php artisan down --secret="your-bypass-token"

# Step 4 — Recreate app and scheduler containers with new image
docker compose up -d --no-deps --force-recreate app scheduler

# Step 5 — Wait for health check to pass
until docker compose exec app curl -sf http://localhost/up; do
  echo "Waiting for app..."
  sleep 5
done

# Step 6 — Restart queue workers gracefully (processes in-flight jobs first)
docker compose exec app php artisan queue:restart

# Step 7 — Disable maintenance mode
docker compose exec app php artisan up

# Step 8 — Final health check
curl -sf https://your-domain.com/up && echo "DEPLOYMENT OK" || echo "DEPLOYMENT FAILED"
```

### Important Migration Rules

- **Only additive migrations** in zero-downtime deployments (add columns/tables, never drop)
- **Never rename columns** in zero-downtime — add new + backfill + remove old in separate deployment
- If a migration is destructive, schedule a maintenance window instead of using `--force`

---

## 10. Rollback Procedure

### Code Rollback

```bash
# Find the last working commit
git log --oneline -10

# Rollback to a specific commit
git checkout <commit-hash>
docker compose build app
docker compose up -d --no-deps --force-recreate app scheduler
```

### Database Rollback

```bash
# Roll back the last migration batch
docker compose exec app php artisan migrate:rollback

# Roll back a specific number of steps
docker compose exec app php artisan migrate:rollback --step=2
```

### Full Rollback from Backup

See [BACKUP_STRATEGY.md](BACKUP_STRATEGY.md) for restore procedures.

---

## 11. Container Management Cheatsheet

```bash
# View all container status
docker compose ps

# View real-time logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f app
docker compose logs -f mysql
docker compose logs -f redis

# Restart a specific service
docker compose restart app

# Exec into app container (bash)
docker compose exec app bash

# Exec into MySQL
docker compose exec mysql mysql -u aikfs -p"$DB_PASSWORD" aikfs

# Exec into Redis CLI
docker compose exec redis redis-cli -a "$REDIS_PASSWORD"

# Check queue workers
docker compose exec app supervisorctl status

# Restart all queue workers
docker compose exec app supervisorctl restart workers:*

# Check pending jobs
docker compose exec app php artisan queue:monitor

# Clear all caches
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear
docker compose exec app php artisan view:clear

# Re-cache all (after config change)
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache

# Run specific scheduled task manually
docker compose exec app php artisan trending:recompute --window=7d

# View failed jobs
docker compose exec app php artisan queue:failed

# Retry all failed jobs
docker compose exec app php artisan queue:retry all

# Flush failed jobs
docker compose exec app php artisan queue:flush

# Check disk usage of volumes
docker system df -v

# Remove dangling images after deployments
docker image prune -f
```

---

## Post-Deployment Smoke Test

Run these after every deployment:

```bash
# 1. Health endpoint
curl -sf https://your-domain.com/up && echo "OK"

# 2. API ping
curl -s https://your-domain.com/api/v1/ping | python3 -m json.tool

# 3. Queue workers all running
docker compose exec app supervisorctl status | grep -E "RUNNING|FATAL"

# 4. No failed jobs
docker compose exec app php artisan queue:failed

# 5. Redis connected
docker compose exec app php artisan tinker --execute="echo Cache::store('redis')->ping();"

# 6. Check error logs (should be empty after fresh deploy)
docker compose exec app tail -50 storage/logs/laravel-$(date +%Y-%m-%d).log
```
