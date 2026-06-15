# AIKFS — Monitoring Strategy

> Goal: Detect issues before users report them. Alert on what matters, not on noise.

---

## Monitoring Layers

| Layer              | What to Monitor                          | Tool               | Alert?   |
|--------------------|------------------------------------------|--------------------|----------|
| Uptime             | `/up` endpoint HTTP 200                  | UptimeRobot / BU   | Yes — SMS |
| Application        | Error rate, slow requests, queue depth   | Laravel Telescope / custom | Yes |
| Infrastructure     | CPU, RAM, disk, network                  | Docker stats / cAdvisor | Yes |
| Database           | Connections, slow queries, replication   | MySQL slow log     | Yes      |
| Redis              | Memory usage, evictions, hit rate        | redis-cli INFO     | Yes      |
| Queues             | Failed jobs, queue depth, worker health  | Laravel built-in   | Yes      |
| SSL                | Certificate expiry                       | Certbot timer      | Yes      |
| Logs               | Error spikes, exceptions                 | Tail logs / Loki   | Yes      |
| AI API             | Anthropic API errors, token costs        | Job metadata table | Warning  |

---

## 1. Uptime Monitoring (External)

Use an external service that checks from outside your server — catches total outages.

### UptimeRobot (Free Tier Sufficient)

1. Create account at uptimerobot.com
2. Add monitor:
   - Type: HTTPS
   - URL: `https://your-domain.com/up`
   - Interval: 5 minutes
   - Alert: Email + SMS on downtime
3. Add secondary: `https://your-domain.com/api/v1/ping`

### What `/up` Checks

The Laravel `/up` endpoint returns 200 only when:
- PHP-FPM is responding
- Database connection is alive
- Application is not in maintenance mode

---

## 2. Infrastructure Monitoring

### Quick Docker Stats (Manual)

```bash
# Real-time resource usage for all containers
docker stats aikfs_app aikfs_mysql aikfs_redis aikfs_scheduler

# Output columns: CPU%, MEM USAGE/LIMIT, NET I/O, BLOCK I/O
```

### Automated Resource Alerts (Cron-based, Lightweight)

Add to host crontab for disk/memory alerts without external tools:

```bash
# Alert if disk > 80% full
*/15 * * * * USAGE=$(df /var/www | tail -1 | awk '{print $5}' | tr -d '%'); \
  [ "$USAGE" -gt 80 ] && \
  curl -s -X POST https://hooks.slack.com/YOUR_WEBHOOK \
  -H 'Content-type: application/json' \
  --data "{\"text\":\"AIKFS: Disk usage at ${USAGE}%\"}"

# Alert if MySQL container is not healthy
*/5 * * * * docker inspect aikfs_mysql --format='{{.State.Health.Status}}' | \
  grep -v healthy && \
  curl -s -X POST https://hooks.slack.com/YOUR_WEBHOOK \
  -H 'Content-type: application/json' \
  --data '{"text":"ALERT: MySQL container unhealthy!"}'
```

### Grafana + cAdvisor (Recommended for Scale)

```yaml
# Add to docker-compose.yml for metrics collection
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    container_name: aikfs_cadvisor
    restart: unless-stopped
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - aikfs_net
    # Expose only to monitoring network, not public

  prometheus:
    image: prom/prometheus:latest
    container_name: aikfs_prometheus
    restart: unless-stopped
    volumes:
      - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - aikfs_net

  grafana:
    image: grafana/grafana:latest
    container_name: aikfs_grafana
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"    # only accessible via SSH tunnel
    networks:
      - aikfs_net
```

---

## 3. Application-Level Monitoring

### Error Logs

```bash
# Watch error log in real-time
docker compose exec app tail -f storage/logs/laravel-$(date +%Y-%m-%d).log

# Count errors in today's log
docker compose exec app grep -c "ERROR\|CRITICAL" \
  storage/logs/laravel-$(date +%Y-%m-%d).log

# Show last 10 exceptions with context
docker compose exec app grep -A5 "CRITICAL\|ERROR" \
  storage/logs/laravel-$(date +%Y-%m-%d).log | tail -60
```

### Slack Alerts for Critical Errors

Already configured in `config/logging.php`. Set these in `.env`:

```bash
LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

In `config/logging.php`, the `slack` channel is available. Update the `stack` channel to include it for critical errors:

```php
'stack' => [
    'driver'            => 'stack',
    'channels'          => ['daily', 'slack'],
    'ignore_exceptions' => false,
],
'slack' => [
    'driver'   => 'slack',
    'url'      => env('LOG_SLACK_WEBHOOK_URL'),
    'username' => 'AIKFS',
    'emoji'    => ':rotating_light:',
    'level'    => 'critical',
],
```

### Laravel Telescope (Dev/Staging Only)

Do NOT run Telescope in production with public access. For debugging production issues, use it on a staging environment or protect the route behind IP allowlist:

```php
// In TelescopeServiceProvider::gate()
Gate::define('viewTelescope', function ($user) {
    return in_array(request()->ip(), ['your-office-ip']);
});
```

---

## 4. Queue Monitoring

### Check Queue Health (Manual)

```bash
# Show queue sizes
docker compose exec app php artisan queue:monitor \
  redis:default,redis:notifications,redis:cache

# List failed jobs
docker compose exec app php artisan queue:failed

# Check worker process status
docker compose exec app supervisorctl status | grep queue
```

### Queue Depth Alert (Cron)

```bash
# Alert if default queue has > 100 pending jobs
*/10 * * * * DEPTH=$(docker compose -f /var/www/aikfs/docker-compose.yml exec -T app \
  php artisan tinker --execute="echo Queue::size('default');" 2>/dev/null | tr -d '\r\n'); \
  [ "${DEPTH:-0}" -gt 100 ] && \
  curl -s -X POST https://hooks.slack.com/YOUR_WEBHOOK \
  -H 'Content-type: application/json' \
  --data "{\"text\":\"AIKFS: Queue depth is ${DEPTH} jobs — workers may be stuck\"}"
```

### Automated Failed Job Alerts

Add a scheduled command to `routes/console.php`:

```php
// Alert on new failed jobs (runs every 15 min)
Schedule::call(function () {
    $count = DB::table('failed_jobs')
        ->where('failed_at', '>=', now()->subMinutes(15))
        ->count();

    if ($count > 0) {
        Log::critical("$count new failed jobs in the last 15 minutes", [
            'jobs' => DB::table('failed_jobs')
                ->where('failed_at', '>=', now()->subMinutes(15))
                ->pluck('payload')
                ->map(fn($p) => json_decode($p)->displayName ?? 'unknown')
                ->toArray(),
        ]);
    }
})->everyFifteenMinutes();
```

---

## 5. Database Monitoring

### Slow Query Log

MySQL slow query log is already enabled (`slow_query_log = ON`, threshold = 2 seconds).

```bash
# View slow queries
docker compose exec mysql tail -f /var/log/mysql/slow.log

# Analyze slow queries with pt-query-digest (install percona tools)
docker compose exec mysql mysqldumpslow /var/log/mysql/slow.log | head -30
```

### Connection Count

```bash
# Check current connections
docker compose exec mysql mysql -u root -p"$DB_ROOT_PASSWORD" \
  -e "SHOW STATUS LIKE 'Threads_connected';"

# Max connections config (set to 200 in my.cnf)
docker compose exec mysql mysql -u root -p"$DB_ROOT_PASSWORD" \
  -e "SHOW VARIABLES LIKE 'max_connections';"
```

### Daily Database Report

```bash
# Add to cron — runs at 08:00 daily
0 8 * * * docker compose -f /var/www/aikfs/docker-compose.yml exec -T mysql \
  mysql -u root -p"$DB_ROOT_PASSWORD" aikfs -e "
    SELECT 'Users' as table_name, COUNT(*) as rows FROM users
    UNION SELECT 'Projects', COUNT(*) FROM projects
    UNION SELECT 'Failed Jobs', COUNT(*) FROM failed_jobs;
  " 2>/dev/null >> /var/log/aikfs-db-report.log
```

---

## 6. Redis Monitoring

```bash
# Full Redis stats
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" INFO all

# Key metrics to check
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" INFO stats | grep -E \
  "instantaneous_ops_per_sec|evicted_keys|keyspace_hits|keyspace_misses"

docker compose exec redis redis-cli -a "$REDIS_PASSWORD" INFO memory | grep -E \
  "used_memory_human|mem_fragmentation_ratio|maxmemory_human"
```

### Redis Alert Thresholds

| Metric                   | Warning     | Critical    | Action                              |
|--------------------------|-------------|-------------|-------------------------------------|
| `used_memory`            | > 200 MB    | > 240 MB    | Increase `maxmemory` or scale       |
| `evicted_keys`           | > 0 / min   | > 100 / min | Sessions/cache being evicted early  |
| `keyspace_misses` ratio  | > 20%       | > 50%       | Cache warming not working           |
| `connected_clients`      | > 50        | > 100       | Check for connection leaks          |

```bash
# Alert if Redis memory > 220 MB
*/5 * * * * MEM=$(docker compose -f /var/www/aikfs/docker-compose.yml exec -T redis \
  redis-cli -a "$REDIS_PASSWORD" info memory 2>/dev/null | \
  grep used_memory: | awk -F: '{print $2}' | tr -d '\r\n'); \
  [ "${MEM:-0}" -gt 230686720 ] && \
  curl -s -X POST https://hooks.slack.com/YOUR_WEBHOOK \
  --data "{\"text\":\"AIKFS Redis: Memory at $(echo $MEM | numfmt --to=iec) / 256MB\"}"
```

---

## 7. SSL Certificate Monitoring

```bash
# Check certificate expiry manually
echo | openssl s_client -connect your-domain.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Alert 14 days before expiry (add to cron, weekly)
0 9 * * 1 EXPIRY=$(echo | openssl s_client -connect your-domain.com:443 2>/dev/null | \
  openssl x509 -noout -enddate | cut -d= -f2); \
  DAYS=$(( ($(date -d "$EXPIRY" +%s) - $(date +%s)) / 86400 )); \
  [ "$DAYS" -lt 14 ] && \
  curl -s -X POST https://hooks.slack.com/YOUR_WEBHOOK \
  --data "{\"text\":\"AIKFS: SSL cert expires in ${DAYS} days!\"}"
```

Certbot auto-renews certificates when they're < 30 days from expiry. The cron above catches cases where renewal fails.

---

## 8. AI API Monitoring

The `ai_results` table stores token usage per job. Monitor costs and failures:

```bash
# Daily AI usage report
docker compose exec app php artisan tinker --execute="
  use App\Models\AiResult;
  \$stats = AiResult::where('created_at', '>=', now()->subDay())
    ->selectRaw('status, COUNT(*) as count, SUM(JSON_EXTRACT(metadata, \"$.input_tokens\")) as in_tokens, SUM(JSON_EXTRACT(metadata, \"$.output_tokens\")) as out_tokens')
    ->groupBy('status')
    ->get();
  print_r(\$stats->toArray());
"
```

### Alert on High AI Failure Rate

```php
// Add to routes/console.php
Schedule::call(function () {
    $failureRate = AiResult::where('created_at', '>=', now()->subHour())
        ->selectRaw('status, COUNT(*) as count')
        ->groupBy('status')
        ->pluck('count', 'status');

    $total = array_sum($failureRate->toArray());
    $failed = $failureRate->get('failed', 0);

    if ($total > 0 && ($failed / $total) > 0.2) {
        Log::critical('AI job failure rate exceeded 20%', [
            'failed' => $failed,
            'total' => $total,
            'rate' => round($failed / $total * 100, 1) . '%',
        ]);
    }
})->hourly();
```

---

## 9. Key Metrics Dashboard (Minimal)

If you're not using Grafana, create a simple status page by adding an admin-only artisan command:

```bash
docker compose exec app php artisan tinker --execute="
echo '=== AIKFS Health Report ===';
echo 'Users: ' . App\Models\User::count();
echo 'Projects: ' . App\Models\Project::count();
echo 'Queue depth (default): ' . Queue::size('default');
echo 'Queue depth (notifications): ' . Queue::size('notifications');
echo 'Failed jobs: ' . DB::table('failed_jobs')->count();
echo 'Cache hit: ' . Cache::get('aikfs_cache_test', 'MISS');
echo 'Redis ping: ' . Redis::ping();
"
```

---

## 10. Incident Response Runbook

### App Returns 500

```bash
docker compose logs app --tail=100 | grep -i "error\|exception\|fatal"
docker compose exec app tail -50 storage/logs/laravel-$(date +%Y-%m-%d).log
docker compose exec app supervisorctl status
```

### Queue Workers Stopped

```bash
docker compose exec app supervisorctl status
docker compose exec app supervisorctl restart workers:*
docker compose exec app php artisan queue:restart
```

### MySQL Connection Refused

```bash
docker compose ps mysql
docker compose logs mysql --tail=50
docker compose restart mysql
# If data corrupt: restore from backup (see BACKUP_STRATEGY.md)
```

### Disk Full

```bash
df -h
docker system df
docker image prune -f      # remove dangling images
docker volume ls           # identify large volumes
find /backups -name "*.gz" -mtime +30 -delete   # prune old backups
```

### High Memory / OOM

```bash
docker stats
# Identify which container is consuming memory
docker compose restart <container>
# If PHP-FPM OOM: reduce pm.max_children in docker/php/php-fpm.conf
```

### SSL Certificate Expired

```bash
certbot renew --force-renewal
docker compose exec app nginx -s reload
```
