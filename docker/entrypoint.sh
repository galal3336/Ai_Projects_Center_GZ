#!/bin/sh
set -e

APP_DIR=/var/www/html

# ── Create log directories ─────────────────────────────────────────────────────
mkdir -p /var/log/supervisor /var/log/php /var/log/nginx
chown www-data:www-data /var/log/php

# ── Wait for MySQL ─────────────────────────────────────────────────────────────
echo "Waiting for MySQL..."
until php -r "
  try {
    \$pdo = new PDO('mysql:host=${DB_HOST};port=${DB_PORT:-3306};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');
    echo 'ok';
  } catch (Exception \$e) {
    exit(1);
  }
" 2>/dev/null | grep -q ok; do
  sleep 2
done
echo "MySQL is ready."

# ── Storage symlink ───────────────────────────────────────────────────────────
php "$APP_DIR/artisan" storage:link --no-interaction || true

# ── Run migrations ────────────────────────────────────────────────────────────
php "$APP_DIR/artisan" migrate --force --no-interaction

# ── Optimise framework ────────────────────────────────────────────────────────
php "$APP_DIR/artisan" config:cache  --no-interaction
php "$APP_DIR/artisan" route:cache   --no-interaction
php "$APP_DIR/artisan" view:cache    --no-interaction
php "$APP_DIR/artisan" event:cache   --no-interaction
php "$APP_DIR/artisan" icons:cache   --no-interaction 2>/dev/null || true

# ── Fix permissions ───────────────────────────────────────────────────────────
chown -R www-data:www-data "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"

echo "AIKFS bootstrap complete."
exec "$@"
