# AIKFS — Backup Strategy

> Recovery Point Objective (RPO): 6 hours (DB), 24 hours (storage)
> Recovery Time Objective (RTO): < 30 minutes for full restore

---

## What Gets Backed Up

| Asset            | Location (in container)                  | Volume              | Backup Method       | Frequency     |
|------------------|------------------------------------------|---------------------|---------------------|---------------|
| MySQL database   | `/var/lib/mysql`                         | `aikfs_mysql_data`  | `mysqldump` + gzip  | Every 6 hours |
| User uploads     | `/var/www/html/storage/app/public/`      | `aikfs_app_storage` | `tar + gzip`        | Daily         |
| Application logs | `/var/www/html/storage/logs/`            | `aikfs_app_logs`    | Docker log rotation | Retained 30d  |
| Redis state      | `/data` (AOF + RDB)                      | `aikfs_redis_data`  | Redis persistence   | Continuous    |

> **Not backed up separately:** Redis (reconstructed from queues + DB on restart), Vite build artifacts (rebuilt from source), vendor/ and node_modules/ (reinstalled from composer.json/package.json).

---

## Backup Schedule

| Job              | Cron             | Retention | Command                          |
|------------------|------------------|-----------|----------------------------------|
| Full backup      | `0 2 * * *`      | 30 days   | `backup.sh --full`               |
| DB-only backup   | `0 */6 * * *`    | 30 days   | `backup.sh --db-only`            |
| Off-site sync    | `30 3 * * *`     | 30 days   | `rclone sync /backups/aikfs s3:` |
| Backup verify    | `0 4 * * 1`      | —         | Test restore on staging (weekly) |

---

## Setting Up Backup Cron

Add these lines to the **host machine** crontab (`crontab -e` as root or deploy user):

```cron
# AIKFS Backup Jobs
# Full backup every day at 02:00 UTC
0 2 * * * DB_PASSWORD="$(grep DB_PASSWORD /var/www/aikfs/.env | cut -d= -f2)" \
  docker compose -f /var/www/aikfs/docker-compose.yml exec -T app \
  /var/www/html/docker/backup.sh --full >> /var/log/aikfs-backup.log 2>&1

# DB-only every 6 hours (02:00 is covered by full, skip it)
0 6,12,18 * * * DB_PASSWORD="$(grep DB_PASSWORD /var/www/aikfs/.env | cut -d= -f2)" \
  docker compose -f /var/www/aikfs/docker-compose.yml exec -T app \
  /var/www/html/docker/backup.sh --db-only >> /var/log/aikfs-backup.log 2>&1

# Off-site sync at 03:30 UTC daily
30 3 * * * rclone sync /backups/aikfs s3:your-bucket/aikfs-backups \
  --log-file=/var/log/aikfs-rclone.log --log-level=INFO
```

### Backup Log Rotation

```bash
cat > /etc/logrotate.d/aikfs-backup <<'EOF'
/var/log/aikfs-backup.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    create 0640 root root
}
EOF
```

---

## Off-Site Storage (Required for Production)

Local backups alone are not sufficient — a server failure would destroy both the data and the backup. Configure at least one off-site destination.

### Option A: AWS S3 (Recommended)

```bash
# Install rclone
curl https://rclone.org/install.sh | bash

# Configure S3 remote
rclone config
# Name: s3-aikfs
# Type: s3
# Provider: AWS
# Access key / secret: your IAM credentials
# Bucket: aikfs-backups
# Region: ap-southeast-1 (or nearest)

# Test sync
rclone ls s3-aikfs:aikfs-backups

# Enable versioning on bucket (protects against accidental deletion)
aws s3api put-bucket-versioning \
  --bucket aikfs-backups \
  --versioning-configuration Status=Enabled
```

### Option B: Remote Server (rsync over SSH)

```bash
# On the remote server, create backup user
useradd -m aikfs-backup
mkdir -p /home/aikfs-backup/.ssh
# Paste deploy server's public key into authorized_keys

# On the application server
rsync -avz --delete \
  /backups/aikfs/ \
  aikfs-backup@backup-server.example.com:/backups/aikfs/
```

---

## Point-in-Time Recovery (MySQL Binary Logs)

MySQL is configured with binary logging enabled (`log_bin`). This allows restoring the database to any point in time between backups.

### How Binary Logging Works

MySQL continuously writes every change to binary log files at `/var/log/mysql/mysql-bin.*`. Combined with a full `mysqldump` baseline, you can replay any changes that occurred after the dump.

### Using PITR

```bash
# 1. Restore the nearest baseline dump (e.g., 02:00 backup)
gunzip -c /backups/aikfs/db/aikfs_db_20260615_020000.sql.gz | \
  docker compose exec -T mysql mysql -u root -p"$DB_ROOT_PASSWORD" aikfs

# 2. Identify binary log files that cover the target time window
docker compose exec mysql ls /var/log/mysql/mysql-bin.*

# 3. Replay binary logs from 02:00 to the target time (e.g., 09:45)
docker compose exec mysql mysqlbinlog \
  --start-datetime="2026-06-15 02:00:00" \
  --stop-datetime="2026-06-15 09:45:00" \
  /var/log/mysql/mysql-bin.000001 \
  /var/log/mysql/mysql-bin.000002 | \
  docker compose exec -T mysql mysql -u root -p"$DB_ROOT_PASSWORD"
```

> Binary logs are retained for 7 days (`binlog_expire_logs_seconds=604800` in `docker/mysql/my.cnf`).

---

## Restore Procedures

### Restore: Database Only

```bash
# 1. Put app in maintenance mode
docker compose exec app php artisan down

# 2. Choose the backup file
ls -lh /backups/aikfs/db/

# 3. Restore
gunzip -c /backups/aikfs/db/aikfs_db_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T mysql mysql \
  -u aikfs -p"$DB_PASSWORD" aikfs

# 4. Verify row counts
docker compose exec mysql mysql -u aikfs -p"$DB_PASSWORD" aikfs \
  -e "SELECT COUNT(*) FROM projects; SELECT COUNT(*) FROM users;"

# 5. Bring app back up
docker compose exec app php artisan up
```

### Restore: Storage / Media Only

```bash
# 1. List available archives
ls -lh /backups/aikfs/storage/

# 2. Restore to the storage volume
gunzip -c /backups/aikfs/storage/aikfs_storage_YYYYMMDD_HHMMSS.tar.gz | \
  docker compose exec -T app tar -xz -C /var/www/html/storage/app

# 3. Fix ownership
docker compose exec app chown -R www-data:www-data /var/www/html/storage/app/public/

# 4. Re-create storage symlink if needed
docker compose exec app php artisan storage:link
```

### Restore: Full (Database + Storage)

```bash
# 1. Maintenance mode on
docker compose exec app php artisan down

# 2. Restore database
gunzip -c /backups/aikfs/db/aikfs_db_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T mysql mysql -u aikfs -p"$DB_PASSWORD" aikfs

# 3. Restore storage
gunzip -c /backups/aikfs/storage/aikfs_storage_YYYYMMDD_HHMMSS.tar.gz | \
  docker compose exec -T app tar -xz -C /var/www/html/storage/app

# 4. Clear caches (stale data from old state)
docker compose exec app php artisan cache:clear

# 5. Restart queue workers (clear in-flight jobs from old state)
docker compose exec app php artisan queue:restart

# 6. Maintenance mode off
docker compose exec app php artisan up

# 7. Smoke test
curl -sf https://your-domain.com/up && echo "OK"
```

### Restore: Disaster Recovery (New Server)

```bash
# On the new server:

# 1. Follow steps 2 and 3 from DEPLOYMENT_GUIDE.md (server setup + project clone)

# 2. Copy .env from backup or password manager
nano /var/www/aikfs/.env

# 3. Copy backups from off-site storage
rclone copy s3-aikfs:aikfs-backups/db /backups/aikfs/db
rclone copy s3-aikfs:aikfs-backups/storage /backups/aikfs/storage

# 4. Start services (without app — it needs DB first)
docker compose up -d mysql redis
sleep 30  # wait for MySQL to initialize

# 5. Create database and user (first run only)
docker compose exec mysql mysql -u root -p"$DB_ROOT_PASSWORD" -e "
  CREATE DATABASE IF NOT EXISTS aikfs;
  CREATE USER IF NOT EXISTS 'aikfs'@'%' IDENTIFIED BY '$DB_PASSWORD';
  GRANT ALL PRIVILEGES ON aikfs.* TO 'aikfs'@'%';
  FLUSH PRIVILEGES;
"

# 6. Restore database
gunzip -c /backups/aikfs/db/aikfs_db_LATEST.sql.gz | \
  docker compose exec -T mysql mysql -u aikfs -p"$DB_PASSWORD" aikfs

# 7. Start app
docker compose up -d app scheduler

# 8. Restore storage
gunzip -c /backups/aikfs/storage/aikfs_storage_LATEST.tar.gz | \
  docker compose exec -T app tar -xz -C /var/www/html/storage/app

# 9. Verify
curl -sf https://your-domain.com/up && echo "RESTORED"
```

---

## Backup Integrity Verification (Weekly Test)

Run this script every Monday (add to cron `0 4 * * 1`):

```bash
#!/bin/bash
# Verify latest DB backup is valid

LATEST=$(ls -t /backups/aikfs/db/*.sql.gz | head -1)
echo "Testing backup: $LATEST"

# Check file size > 10 KB (non-empty)
SIZE=$(stat -c%s "$LATEST")
if [ "$SIZE" -lt 10240 ]; then
  echo "ALERT: Backup too small ($SIZE bytes) — possible empty dump!"
  # TODO: send alert via curl to your webhook/email
  exit 1
fi

# Check gzip integrity
if ! gzip -t "$LATEST"; then
  echo "ALERT: Backup file is corrupt!"
  exit 1
fi

# Check dump contains expected tables
TABLE_COUNT=$(gunzip -c "$LATEST" | grep -c "^CREATE TABLE")
if [ "$TABLE_COUNT" -lt 10 ]; then
  echo "ALERT: Only $TABLE_COUNT tables found — expected > 10!"
  exit 1
fi

echo "Backup OK: $(du -sh "$LATEST" | cut -f1), $TABLE_COUNT tables"
```

---

## Redis Persistence

Redis is configured with:
- **AOF (Append-Only File):** Every write appended to disk with `appendfsync everysec` — maximum 1 second of data loss
- **RDB snapshots:** Automatic snapshots via Redis default config as secondary protection

Redis data is in the `aikfs_redis_data` Docker volume. Since Redis caches sessions, queue jobs, and cache — losing it causes:
- Users logged out (sessions expire → must re-login)
- In-flight queue jobs lost (retry from `failed_jobs` table if needed)
- Cache cold-start (WarmProjectCache will re-populate on next hourly run)

**Redis is recoverable without a backup** because the source of truth is MySQL. Redis backup is therefore optional but still recommended for busy deployments.

---

## Backup Disk Sizing

| Data Growth Rate | 6-month DB size | 6-month Storage size | Recommended Backup Disk |
|-----------------|-----------------|---------------------|------------------------|
| Low (< 100 users)   | ~500 MB    | ~5 GB               | 20 GB                  |
| Medium (< 1k users) | ~2 GB      | ~20 GB              | 60 GB                  |
| High (< 10k users)  | ~10 GB     | ~100 GB             | 250 GB (or S3)         |

> For high-traffic deployments, use S3 as the primary backup destination and skip local storage entirely.
