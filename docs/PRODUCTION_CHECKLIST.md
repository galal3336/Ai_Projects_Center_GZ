# AIKFS — Production Checklist

> Run through every item before going live. Mark each `[x]` as you complete it.
> **Date:** ___________  **Engineer:** ___________

---

## 1. Environment Variables

- [ ] `APP_KEY` generated: `php artisan key:generate --show` and pasted into `.env`
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL` set to `https://your-domain.com` (no trailing slash)
- [ ] `SESSION_DOMAIN` set to `your-domain.com`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `SESSION_ENCRYPT=true`
- [ ] `DB_PASSWORD` is a random string ≥ 20 chars (not `CHANGE_ME_*`)
- [ ] `DB_ROOT_PASSWORD` is a random string ≥ 20 chars (not `CHANGE_ME_*`)
- [ ] `REDIS_PASSWORD` is a random string ≥ 20 chars (not `CHANGE_ME_*`)
- [ ] `ANTHROPIC_API_KEY` starts with `sk-ant-` (not `CHANGE_ME_*`)
- [ ] `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD` filled with real SMTP credentials
- [ ] `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` generated (run `php artisan reverb:install` locally then copy values)
- [ ] `REVERB_HOST` set to `your-domain.com`, `REVERB_SCHEME=https`, `REVERB_PORT=443`
- [ ] `LOG_LEVEL=error` (not `debug`)
- [ ] `BCRYPT_ROUNDS=12`
- [ ] No `CHANGE_ME_*` strings remain: `grep -r "CHANGE_ME" .env` returns empty
- [ ] `.env` file is NOT committed to git: `git status .env` shows untracked/ignored

---

## 2. Server & Docker

- [ ] Server OS: Ubuntu 22.04 LTS or Debian 12 (64-bit)
- [ ] Minimum specs: 2 vCPU / 4 GB RAM / 40 GB SSD (recommend 4 vCPU / 8 GB for production)
- [ ] Docker ≥ 27.0 installed: `docker --version`
- [ ] Docker Compose v2 installed: `docker compose version`
- [ ] Current user in `docker` group (no `sudo` required): `groups $USER | grep docker`
- [ ] Swap enabled (at least 2 GB): `swapon --show`
- [ ] System clock synced (NTP): `timedatectl status` shows `synchronized: yes`
- [ ] Firewall configured: only ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open
- [ ] Port 3306 (MySQL) NOT exposed externally: `ss -tlnp | grep 3306` shows only 127.0.0.1 or nothing
- [ ] Port 6379 (Redis) NOT exposed externally: `ss -tlnp | grep 6379` shows only 127.0.0.1 or nothing
- [ ] SSH hardened: password auth disabled, key-only access
- [ ] Unattended security upgrades configured: `apt list --installed | grep unattended`

---

## 3. SSL / TLS

- [ ] Domain DNS A record pointing to server IP (verify: `dig +short your-domain.com`)
- [ ] Certbot installed: `certbot --version`
- [ ] SSL certificate issued: `certbot certonly --standalone -d your-domain.com`
- [ ] Nginx SSL block configured (see `docker/nginx/default.conf` → update to 443 + redirect 80→443)
- [ ] Certificate auto-renewal timer active: `systemctl status certbot.timer`
- [ ] HSTS header present: `curl -I https://your-domain.com | grep Strict-Transport`
- [ ] SSL grade A or A+: verify at ssllabs.com/ssltest

---

## 4. Database (MySQL)

- [ ] MySQL 8.4 container healthy: `docker compose ps mysql` shows `healthy`
- [ ] `aikfs` database exists: `docker compose exec mysql mysql -u root -p -e "SHOW DATABASES;"`
- [ ] `aikfs` user has correct grants: `SHOW GRANTS FOR 'aikfs'@'%';`
- [ ] All migrations applied: `docker compose exec app php artisan migrate:status` — no pending
- [ ] Binary logging enabled (verify in my.cnf): `log_bin = /var/log/mysql/mysql-bin.log`
- [ ] InnoDB buffer pool at 512 MB (server must have ≥ 2 GB RAM for MySQL container)
- [ ] Slow query log active (threshold 2 s): `docker compose exec mysql mysql -u root -p -e "SHOW VARIABLES LIKE 'slow_query%';"`
- [ ] Root password stored securely (password manager / vault) — not in shell history

---

## 5. Redis

- [ ] Redis 7.4 container healthy: `docker compose ps redis` shows `healthy`
- [ ] Password authentication works: `docker compose exec redis redis-cli -a "$REDIS_PASSWORD" ping` → `PONG`
- [ ] Max memory set to 256 MB: `docker compose exec redis redis-cli -a "$REDIS_PASSWORD" config get maxmemory`
- [ ] Eviction policy `allkeys-lru`: `config get maxmemory-policy`
- [ ] AOF persistence enabled: `config get appendonly` → `yes`
- [ ] DB segregation correct: cache=0, sessions=1, queue=2 (matches `.env`)
- [ ] `redis_data` volume exists and is persistent: `docker volume inspect aikfs_redis_data`

---

## 6. Queues & Workers

- [ ] All queue workers running via Supervisor:
  - `docker compose exec app supervisorctl status` shows `RUNNING` for:
    - `queue-default:queue-default_00`
    - `queue-default:queue-default_01`
    - `queue-notifications:queue-notifications_00`
    - `queue-cache:queue-cache_00`
- [ ] Dispatch a test job and confirm it processes: `docker compose exec app php artisan tinker --execute="dispatch(new App\Jobs\WarmProjectCache());"`
- [ ] Failed jobs table exists: `docker compose exec app php artisan queue:failed` returns cleanly
- [ ] No failed jobs in table: `docker compose exec app php artisan queue:failed | grep "No failed jobs"`
- [ ] Queue restart scheduled (every 30 min in production): confirmed in `routes/console.php`

---

## 7. Scheduler

- [ ] Scheduler container running: `docker compose ps scheduler` shows `Up`
- [ ] Scheduler container logs clean (no exceptions): `docker compose logs scheduler --tail=50`
- [ ] Test scheduler manually: `docker compose exec app php artisan schedule:run --verbose`
- [ ] Scheduled tasks registered: `docker compose exec app php artisan schedule:list`

---

## 8. Storage & File Uploads

- [ ] Storage symlink created: `ls -la /var/www/html/public/storage` → symlink to `storage/app/public`
- [ ] `app_storage` volume mounted and writable: `docker compose exec app touch /var/www/html/storage/app/public/test && rm /var/www/html/storage/app/public/test`
- [ ] `FILESYSTEM_DISK=public` in `.env`
- [ ] Spatie Media Library can write: test by uploading a project image via the UI
- [ ] Max upload enforced: Nginx `client_max_body_size 64M` and PHP `upload_max_filesize=64M` consistent with `MEDIA_MAX_FILE_SIZE=20480` in `.env`

---

## 9. WebSocket (Laravel Reverb)

- [ ] Reverb worker running: `supervisorctl status reverb` shows `RUNNING`
- [ ] Nginx proxies WebSocket correctly (wss:// to port 8080 inside container) — add upgrade headers to nginx config
- [ ] Real-time broadcast test: open two browser tabs, trigger an event, confirm it arrives
- [ ] `REVERB_SCHEME=https` in `.env`

---

## 10. Security Headers

Verify all headers present on a production response: `curl -I https://your-domain.com`

- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] `Content-Security-Policy` — add CSP header once frontend origins are confirmed (currently not set; add via Nginx or Laravel middleware)
- [ ] Server tokens hidden: response must NOT contain `Server: nginx/1.x.x`

---

## 11. Application Cache & Optimization

- [ ] Config cached: `docker compose exec app php artisan config:cache`
- [ ] Routes cached: `docker compose exec app php artisan route:cache`
- [ ] Views cached: `docker compose exec app php artisan view:cache`
- [ ] Events cached: `docker compose exec app php artisan event:cache`
- [ ] Opcache enabled and loaded: `docker compose exec app php -m | grep -i opcache`
- [ ] Opcache JIT active: `docker compose exec app php -r "var_dump(opcache_get_status()['jit']);"`

---

## 12. Logging

- [ ] `LOG_LEVEL=error` in production `.env`
- [ ] Log files rotated daily: `docker compose exec app ls storage/logs/`
- [ ] Log volume persistent: `docker volume inspect aikfs_app_logs`
- [ ] No sensitive data (passwords, API keys) logged: spot-check `storage/logs/laravel-*.log`
- [ ] Log aggregation configured (optional): Papertrail, Logtail, or Grafana Loki connected

---

## 13. Backups

- [ ] `/backups/aikfs` directory exists on host with sufficient space (≥ 20 GB)
- [ ] `docker/backup.sh` is executable: `chmod +x docker/backup.sh`
- [ ] Manual backup runs successfully: `docker compose exec app /var/www/html/docker/backup.sh --full`
- [ ] Backup files present: `ls -lh /backups/aikfs/db/ /backups/aikfs/storage/`
- [ ] Restore procedure tested (see Backup Strategy doc)
- [ ] Host cron configured for nightly full backup at 02:00 UTC
- [ ] Host cron configured for DB-only backup every 6 hours
- [ ] Off-site copy configured (rsync/rclone to S3 or remote server)

---

## 14. Health Checks & Monitoring

- [ ] `/up` endpoint returns 200: `curl -sf https://your-domain.com/up && echo OK`
- [ ] `/api/v1/ping` returns JSON: `curl https://your-domain.com/api/v1/ping`
- [ ] Uptime monitor configured (UptimeRobot, Better Uptime, or similar) on `https://your-domain.com/up`
- [ ] Alert contact (email/SMS) configured for downtime
- [ ] Disk usage alert set at 80% threshold

---

## 15. Final Smoke Tests

- [ ] Homepage loads in both English (`/en/`) and Arabic (`/ar/`)
- [ ] User registration works (check email delivery via mail logs)
- [ ] Student can create and submit a project
- [ ] Admin can approve/reject a project
- [ ] AI summary generation dispatches and completes (check queue)
- [ ] File upload (project thumbnail) works and appears in `/storage/`
- [ ] Search returns results
- [ ] Notifications arrive in real-time (Reverb)
- [ ] Sitemap accessible: `curl https://your-domain.com/sitemap.xml`
- [ ] Robots.txt accessible: `curl https://your-domain.com/robots.txt`
- [ ] `/admin` redirects unauthenticated users to login
- [ ] Rate limiting works: rapid requests to `/en/login` receive 429

---

**Signed off by:** _________________________  **Date:** ___________
