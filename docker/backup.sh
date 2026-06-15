#!/bin/bash
# AIKFS — Production backup script
# Usage: ./docker/backup.sh [--full] [--db-only] [--storage-only]
# Cron suggestion: 0 2 * * * /var/www/aikfs/docker/backup.sh --full >> /var/log/aikfs-backup.log 2>&1

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
BACKUP_ROOT="${BACKUP_ROOT:-/backups/aikfs}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
APP_DIR="${APP_DIR:-/var/www/html}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:-aikfs}"
DB_USERNAME="${DB_USERNAME:-aikfs}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD not set}"

MODE="full"
[[ "${1:-}" == "--db-only" ]]      && MODE="db"
[[ "${1:-}" == "--storage-only" ]] && MODE="storage"

echo "=== AIKFS Backup — $(date) — mode: $MODE ==="

mkdir -p "$BACKUP_ROOT/db" "$BACKUP_ROOT/storage"

# ── Database backup ───────────────────────────────────────────────────────────
backup_db() {
  local file="$BACKUP_ROOT/db/aikfs_db_$TIMESTAMP.sql.gz"
  echo "→ Dumping database to $file"
  mysqldump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USERNAME" \
    --password="$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --set-gtid-purged=OFF \
    "$DB_DATABASE" | gzip -9 > "$file"
  echo "  DB backup size: $(du -sh "$file" | cut -f1)"
}

# ── Storage backup ────────────────────────────────────────────────────────────
backup_storage() {
  local file="$BACKUP_ROOT/storage/aikfs_storage_$TIMESTAMP.tar.gz"
  echo "→ Archiving storage to $file"
  tar -czf "$file" \
    -C "$APP_DIR/storage/app" \
    public/
  echo "  Storage backup size: $(du -sh "$file" | cut -f1)"
}

# ── Execute ───────────────────────────────────────────────────────────────────
[[ "$MODE" == "full" || "$MODE" == "db" ]]      && backup_db
[[ "$MODE" == "full" || "$MODE" == "storage" ]] && backup_storage

# ── Prune old backups ─────────────────────────────────────────────────────────
echo "→ Pruning backups older than $RETENTION_DAYS days"
find "$BACKUP_ROOT" -name "*.gz" -mtime +"$RETENTION_DAYS" -delete

echo "=== Backup complete — $(date) ==="
