# AIKFS — Scaling Strategy

> Start small, scale precisely. Every section describes the trigger, the action, and the cost.

---

## Current Architecture (Single Node)

```
Internet → Nginx (80/443) → PHP-FPM (port 9000)
                         → Reverb WebSocket (port 8080)
                         → Queue Workers (Supervisor, 4 processes)
                         → Scheduler (separate container)

MySQL 8.4  ← app container (same host, bridge network)
Redis 7.4  ← app container (same host, bridge network)
```

**Capacity on recommended spec (4 vCPU / 8 GB RAM):**
- Concurrent web users: ~200-500 (depending on PHP-FPM children)
- Queue throughput: ~180 jobs/minute (4 workers × 3 jobs/min avg)
- MySQL connections: up to 200 (configured in my.cnf)
- WebSocket connections: ~1,000-2,000 (Reverb, single process)

---

## Scaling Tiers

### Tier 1 — Vertical Scale (0 → 1,000 daily active users)

**When:** Response times > 500ms, CPU consistently > 70%, memory pressure.

**Action:** Upgrade the VPS — no architecture changes needed.

| Resource       | Current Min | Tier 1 Target  |
|----------------|-------------|----------------|
| CPU            | 2 vCPU      | 4 vCPU         |
| RAM            | 4 GB        | 8 GB           |
| Disk           | 40 GB SSD   | 80 GB NVMe     |
| MySQL Buffer   | 512 MB      | 1 GB           |
| Redis maxmem   | 256 MB      | 512 MB         |
| PHP-FPM procs  | 4–20        | 8–40           |

**Config changes for Tier 1:**

`docker/mysql/my.cnf`:
```ini
innodb_buffer_pool_size = 1G
innodb_buffer_pool_instances = 4
```

`docker/php/php-fpm.conf`:
```ini
pm.max_children = 40
pm.start_servers = 8
pm.min_spare_servers = 4
pm.max_spare_servers = 16
```

`docker-compose.yml` — Redis:
```yaml
command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb ...
```

**Cost:** ~$20-40/month VPS upgrade. Zero code changes.

---

### Tier 2 — Service Separation (1,000 → 10,000 DAU)

**When:** Single machine is maxed on CPU or RAM for one specific service (MySQL or PHP).

**Action:** Move MySQL and Redis to dedicated managed services.

#### 2a. Managed MySQL (AWS RDS / PlanetScale / DigitalOcean Managed DB)

```bash
# In .env, change to external host
DB_HOST=your-rds-endpoint.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_SSL_CA=/etc/ssl/certs/rds-combined-ca-bundle.pem  # if SSL required
```

**Benefits:**
- Automated backups by provider
- Read replicas available (see Tier 3)
- Point-in-time recovery built in
- Automatic failover (Multi-AZ)

**Cost:** ~$30-100/month for db.t4g.medium or equivalent.

#### 2b. Managed Redis (AWS ElastiCache / Upstash / Redis Cloud)

```bash
# In .env
REDIS_HOST=your-elasticache.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-auth-token
```

**Benefits:**
- Automatic failover (cluster mode)
- Scales independently of app
- Redis Sentinel/Cluster supported

**Cost:** ~$20-60/month for cache.t4g.small.

#### 2c. Separate Queue Worker Node

Extract the queue workers and scheduler to a second, smaller VPS:

```yaml
# docker-compose.workers.yml (run on worker node)
services:
  queue-workers:
    image: your-registry/aikfs:latest
    env_file: .env
    command: >
      sh -c "
        php artisan queue:work redis --queue=default --sleep=3 --tries=3 --max-time=3600 &
        php artisan queue:work redis --queue=default --sleep=3 --tries=3 --max-time=3600 &
        php artisan queue:work redis --queue=notifications --sleep=3 --tries=5 &
        php artisan queue:work redis --queue=cache --sleep=5 --tries=2 &
        wait
      "

  scheduler:
    image: your-registry/aikfs:latest
    env_file: .env
    command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
```

**Why separate workers:** AI jobs (GenerateAiSummary, RunAiJudge) are CPU-bound and long-running. They compete with web request handlers on the same CPU budget.

---

### Tier 3 — Horizontal Web Scale (10,000+ DAU)

**When:** Single app server CPU > 80% sustained under load.

**Action:** Multiple app containers behind a load balancer.

#### 3a. Add Docker Registry

Push the built image to a registry so all nodes pull the same artifact:

```bash
# Build and push
docker build -t your-registry/aikfs:v1.2.0 .
docker push your-registry/aikfs:v1.2.0

# On each node, pull and run
docker pull your-registry/aikfs:v1.2.0
```

#### 3b. Load Balancer (Nginx or Traefik)

Replace the per-node Nginx with a shared load balancer (managed LB or self-hosted):

```nginx
# External load balancer nginx.conf
upstream aikfs_app {
    least_conn;                        # route to least-loaded server
    server app-node-1.internal:80;
    server app-node-2.internal:80;
    server app-node-3.internal:80;
    keepalive 32;
}

server {
    listen 443 ssl;
    # ... ssl config ...

    location / {
        proxy_pass http://aikfs_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3c. Session Stickiness vs. Stateless Sessions

AIKFS already stores sessions in Redis (not on the local filesystem), so **no sticky sessions are needed** — any app node can serve any request. This is correct architecture for horizontal scaling.

Verify: `SESSION_DRIVER=redis` in `.env`.

#### 3d. Storage for Multiple Nodes (S3)

When running multiple app nodes, the `public` disk (local filesystem) is a problem — uploads go to node 1 but node 2 can't see them.

**Solution:** Switch to S3 or compatible storage.

```bash
# .env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=aikfs-media
AWS_URL=https://aikfs-media.s3.amazonaws.com
```

Update `config/filesystems.php` disk used by Spatie Media Library to `s3`.

**Cost:** ~$0.023/GB/month on S3 standard.

#### 3e. MySQL Read Replicas

For read-heavy workloads (project listings, search, profiles), add a read replica:

```php
// config/database.php
'mysql' => [
    'read' => [
        'host' => [env('DB_READ_HOST', env('DB_HOST'))],
    ],
    'write' => [
        'host' => [env('DB_HOST')],
    ],
    'sticky' => true,
    // ... rest of config
],
```

```bash
# .env
DB_HOST=rds-primary.us-east-1.rds.amazonaws.com
DB_READ_HOST=rds-replica.us-east-1.rds.amazonaws.com
```

Laravel automatically routes `SELECT` queries to the replica and writes to primary.

---

### Tier 4 — AI Job Isolation (High AI Load)

**When:** AI jobs are monopolizing queue workers and delaying user-facing notifications.

The current queue architecture already isolates AI jobs by queue name. To fully isolate AI job processing:

#### Dedicated AI Worker Container

```yaml
# Add to docker-compose.yml
  queue-ai:
    image: aikfs:latest
    restart: unless-stopped
    env_file: .env
    environment:
      APP_ENV: production
    command: >
      sh -c "
        php artisan queue:work redis --queue=ai --sleep=3 --tries=3 --timeout=120 --max-time=3600 &
        php artisan queue:work redis --queue=ai --sleep=3 --tries=3 --timeout=120 --max-time=3600 &
        wait
      "
    depends_on:
      - redis
      - mysql
    networks:
      - aikfs_net
```

Update AI jobs to dispatch on the `ai` queue:

```php
// In BaseJob or each AI job class
public string $queue = 'ai';
```

#### AI Rate Limiting (Anthropic API)

Add rate limiting to prevent API cost spikes:

```php
// In GenerateAiSummary::handle()
RateLimiter::attempt(
    key: 'anthropic-api',
    maxAttempts: 50,      // 50 requests per minute (stay under Anthropic tier limit)
    callback: fn() => $this->callApi(),
    decaySeconds: 60
) || $this->release(30);  // if rate limited, retry in 30s
```

---

## Performance Optimizations (Apply at Any Tier)

### Database Query Optimization

```bash
# Find N+1 queries using Clockwork (dev) or query logging
docker compose exec app php artisan tinker --execute="
DB::listen(function(\$query) {
  if (\$query->time > 100) {
    logger()->warning('Slow query', ['sql' => \$query->sql, 'time' => \$query->time]);
  }
});
"
```

**Key indexes to verify exist:**
```sql
-- Run in MySQL to check indexes on hot tables
SHOW INDEX FROM projects;
SHOW INDEX FROM project_views;
SHOW INDEX FROM ai_results;

-- Essential indexes (add if missing):
ALTER TABLE projects ADD INDEX idx_status_created (status, created_at);
ALTER TABLE projects ADD INDEX idx_slug (slug);
ALTER TABLE project_views ADD INDEX idx_project_viewed (project_id, viewed_at);
ALTER TABLE ai_results ADD INDEX idx_project_type (project_id, type, status);
```

### PHP Opcache Tuning (Production)

Already configured in `docker/php/php.ini`. Verify after deployment:

```bash
docker compose exec app php -r "
\$s = opcache_get_status();
echo 'Cached scripts: ' . \$s['opcache_statistics']['num_cached_scripts'] . PHP_EOL;
echo 'Hit rate: ' . round(\$s['opcache_statistics']['opcache_hit_rate'], 2) . '%' . PHP_EOL;
echo 'JIT enabled: ' . (\$s['jit']['enabled'] ? 'yes' : 'no') . PHP_EOL;
"
# Expected: hit rate > 95%, JIT: yes
```

### Nginx Response Caching (Public Pages)

For the public project listing and project detail pages, add Nginx fastcgi cache:

```nginx
# nginx.conf — add in http block
fastcgi_cache_path /var/cache/nginx levels=1:2 keys_zone=AIKFS:100m inactive=60m;
fastcgi_cache_key "$scheme$request_method$host$request_uri";

# In server block — cache public pages only
location ~ \.php$ {
    fastcgi_cache AIKFS;
    fastcgi_cache_valid 200 5m;
    fastcgi_cache_bypass $cookie_aikfs_session;  # skip cache for logged-in users
    fastcgi_no_cache $cookie_aikfs_session;
    add_header X-Cache-Status $upstream_cache_status;
    # ... rest of fastcgi config
}
```

This reduces PHP-FPM load for public pages (welcome, project listing, project detail) by ~60-80%.

### WarmProjectCache (Already Implemented)

The `WarmProjectCache` job pre-populates Redis with the most common queries. Verify it's running:

```bash
docker compose exec app php artisan tinker --execute="
echo Cache::has('projects.index.latest.1') ? 'WARM' : 'COLD';
"
```

If cold, dispatch manually:
```bash
docker compose exec app php artisan tinker --execute="
dispatch(new App\Jobs\WarmProjectCache());
"
```

---

## Scaling Decision Tree

```
Response time > 500ms?
│
├── Yes → Check: which container is the bottleneck?
│          │
│          ├── aikfs_app CPU > 70% → Increase PHP-FPM workers OR vertical scale
│          ├── aikfs_mysql CPU > 70% → Move to managed MySQL, add read replica
│          ├── aikfs_redis memory > 80% → Increase maxmemory OR managed Redis
│          └── Queue depth growing → Add more queue workers
│
└── No → Monitor and wait for Tier 2 triggers

Disk > 80%?
├── Yes → Add storage volume OR move media to S3 → Tier 2 action
└── No → Monitor

Concurrent WebSocket > 1,000?
├── Yes → Move Reverb to dedicated server or use Pusher/Ably managed service
└── No → Current Reverb setup sufficient

Multiple app nodes needed?
├── Yes → Requires: managed DB, Redis, S3 storage, load balancer → Full Tier 3
└── No → Single node with vertical scale covers most university/education platforms
```

---

## Cost Summary by Tier

| Tier | Traffic    | Monthly Cost | Architecture                        |
|------|------------|--------------|-------------------------------------|
| 0    | < 100 DAU  | ~$10-20      | Single $10 VPS                      |
| 1    | < 1k DAU   | ~$40-80      | Single upgraded VPS                 |
| 2    | < 10k DAU  | ~$100-200    | VPS + Managed MySQL + Managed Redis |
| 3    | < 100k DAU | ~$400-800    | Multi-node + LB + S3 + CDN         |
| 4    | 100k+ DAU  | ~$1k+        | Kubernetes or ECS + everything managed |

> AIKFS as a university student project platform will likely stay at Tier 1-2 for years. Tier 3+ is documented for completeness.
