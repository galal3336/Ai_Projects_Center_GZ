# AIKFS — Production Deployment Guide

## Prerequisites

- Docker Engine ≥ 27 + Docker Compose v2
- A server with **2 vCPU / 4 GB RAM** minimum (recommended: 4 vCPU / 8 GB)
- Domain pointed at the server IP
- SSL certificate (Let's Encrypt via Certbot or a reverse proxy like Traefik)

---

## Directory layout (generated files)

```
Dockerfile
docker-compose.yml
.env.production           ← copy → .env, fill secrets
docker/
  entrypoint.sh
  nginx/
    nginx.conf
    default.conf
  php/
    php.ini
    php-fpm.conf
  supervisor/
    supervisord.conf
  mysql/
    my.cnf
  backup.sh
```

---

## 1. First-time deployment

### 1a. Clone & configure environment

```bash
git clone https://github.com/your-org/aikfs.git /var/www/aikfs
cd /var/www/aikfs

cp .env.production .env
```

Edit `.env` and set **every** `CHANGE_ME_*` value:

| Variable | What to set |
|---|---|
| `APP_KEY` | `php artisan key:generate --show` (run locally) |
| `APP_URL` | `https://your-domain.com` |
| `DB_PASSWORD` | Strong random password |
| `DB_ROOT_PASSWORD` | Strong random password |
| `REDIS_PASSWORD` | Strong random password |
| `REVERB_APP_ID/KEY/SECRET` | `php artisan reverb:install` values |
| `ANTHROPIC_API_KEY` | Your Anthropic key |
| `MAIL_*` | Your SMTP provider credentials |

### 1b. Build & start

```bash
docker compose build --no-cache
docker compose up -d
```

The container entrypoint automatically runs:
- `migrate --force`
- `config:cache`, `route:cache`, `view:cache`, `event:cache`
- Storage symlink

### 1c. Seed initial data (first run only)

```bash
docker compose exec app php artisan db:seed --force
```

### 1d. Verify

```bash
curl -sf http://localhost/up && echo "OK"
docker compose logs --tail=50 app
```

---

## 2. Queue workers

Workers are managed by **Supervisor** inside the app container. Three pools run automatically:

| Pool | Queue | Workers | Purpose |
|---|---|---|---|
| `queue-default` | `default` | 2 | General jobs, project tracking |
| `queue-notifications` | `notifications` | 1 | Email/broadcast notifications |
| `queue-cache` | `cache` | 1 | `WarmProjectCache` jobs |

Supervisor restarts workers after crashes. The scheduler also restarts workers every 30 min (`queue:restart` is scheduled in `console.php`).

**Monitor workers:**

```bash
docker compose exec app supervisorctl status
docker compose exec app supervisorctl tail -f queue-default_00
```

---

## 3. Laravel Reverb (WebSocket)

Reverb runs on port **8080** inside the container. To expose it:

Option A — expose directly in `docker-compose.yml`:
```yaml
ports:
  - "8080:8080"
```
Then set `REVERB_PORT=8080` and configure your Nginx/firewall accordingly.

Option B (recommended) — proxy through Nginx:
```nginx
location /app/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

---

## 4. Scheduled tasks

The `scheduler` service runs `artisan schedule:run` every 60 seconds. The schedule (`console.php`) includes:

| Task | Frequency |
|---|---|
| `RecomputeTrending --window=7d` | Every 30 min |
| `WarmProjectCache` (job) | Hourly |
| `model:prune ProjectView` | Daily at 03:00 UTC |
| `cache:prune-stale-tags` | Hourly |
| `queue:restart` | Every 30 min (production only) |

---

## 5. Zero-downtime deployments

```bash
# 1. Pull latest code
cd /var/www/aikfs
git pull origin main

# 2. Rebuild image
docker compose build app

# 3. Swap container without downtime (recreates only the app service)
docker compose up -d --no-deps --force-recreate app scheduler

# 4. Verify
docker compose ps
curl -sf https://your-domain.com/up && echo "Healthy"
```

> The entrypoint runs `migrate --force` on startup — safe for additive migrations.
> For destructive migrations, put the app in maintenance mode first:
> ```bash
> docker compose exec app php artisan down --retry=60
> # deploy …
> docker compose exec app php artisan up
> ```

---

## 6. Redis configuration

Redis is configured for:
- **Max memory:** 256 MB with `allkeys-lru` eviction
- **Persistence:** AOF with `everysec` fsync (balance between durability and I/O)
- **DB segregation** (set in `.env`):
  - DB 0 → cache
  - DB 1 → sessions
  - DB 2 → queue

**Monitor Redis:**

```bash
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" info stats
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" monitor  # live
```

---

## 7. Backup strategy

### Automated daily backups

Add to the host's crontab (`crontab -e`):

```cron
# Full backup at 02:00 UTC daily
0 2 * * * BACKUP_ROOT=/backups/aikfs DB_PASSWORD=YOURPASS docker compose -f /var/www/aikfs/docker-compose.yml exec -T app /var/www/html/docker/backup.sh --full >> /var/log/aikfs-backup.log 2>&1

# DB-only every 6 hours
0 */6 * * * BACKUP_ROOT=/backups/aikfs DB_PASSWORD=YOURPASS docker compose -f /var/www/aikfs/docker-compose.yml exec -T app /var/www/html/docker/backup.sh --db-only >> /var/log/aikfs-backup.log 2>&1
```

Backups are stored in `/backups/aikfs/` and pruned after **30 days** (set `RETENTION_DAYS`).

### Restore database

```bash
# Find backup
ls -lh /backups/aikfs/db/

# Restore
gunzip -c /backups/aikfs/db/aikfs_db_20260615_020000.sql.gz | \
  docker compose exec -T mysql mysql \
    -u aikfs -p"$DB_PASSWORD" aikfs
```

### Restore storage

```bash
gunzip -c /backups/aikfs/storage/aikfs_storage_20260615_020000.tar.gz | \
  docker compose exec -T app tar -xz -C /var/www/html/storage/app
```

### Point-in-time recovery (MySQL binary logs)

Binary logging is enabled (`log_bin` in `my.cnf`). To replay events:

```bash
docker compose exec mysql mysqlbinlog \
  --start-datetime="2026-06-15 10:00:00" \
  --stop-datetime="2026-06-15 11:00:00" \
  /var/lib/mysql/mysql-bin.* | \
  docker compose exec -T mysql mysql -u root -p"$DB_ROOT_PASSWORD"
```

---

## 8. SSL (Let's Encrypt via Certbot)

```bash
# Install certbot on the host
certbot certonly --standalone -d your-domain.com

# Mount certs into the container — add to docker-compose.yml app service:
# volumes:
#   - /etc/letsencrypt/live/your-domain.com:/etc/ssl/aikfs:ro

# Update docker/nginx/default.conf to listen 443 ssl:
# listen 443 ssl;
# ssl_certificate     /etc/ssl/aikfs/fullchain.pem;
# ssl_certificate_key /etc/ssl/aikfs/privkey.pem;
```

---

## 9. Useful commands

```bash
# Tail all logs
docker compose logs -f

# Clear all caches
docker compose exec app php artisan optimize:clear

# Re-cache after config change (no rebuild needed)
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache

# Open tinker
docker compose exec app php artisan tinker

# Run a specific job manually
docker compose exec app php artisan queue:work --once

# Flush Redis
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" FLUSHDB

# Check queue depth
docker compose exec app php artisan queue:monitor redis:default,redis:notifications,redis:cache
```

---

## 10. Security checklist

- [ ] All `CHANGE_ME_*` values replaced in `.env`
- [ ] `APP_DEBUG=false` confirmed
- [ ] `.env` not committed to git (check `.gitignore`)
- [ ] Firewall: only ports 80, 443, 22 open externally
- [ ] Reverb port 8080 proxied through Nginx (not exposed directly)
- [ ] MySQL not exposed to host network
- [ ] Redis password set and not exposed to host
- [ ] Backups tested with a restore drill
- [ ] SSL certificate in place and auto-renewing
- [ ] Log rotation configured on host
