<?php

namespace App\Services\Cache;

use App\Contracts\Services\CacheServiceInterface;
use Illuminate\Support\Facades\Cache;

class CacheService implements CacheServiceInterface
{
    private const DEFAULT_TTL = 3600; // 1 hour

    public function __construct(private readonly string $prefix = 'aikfs') {}

    public function remember(string $key, \Closure $callback, ?int $ttl = null): mixed
    {
        return Cache::tags($this->resolveTags($key))
            ->remember($this->key($key), $ttl ?? self::DEFAULT_TTL, $callback);
    }

    public function forget(string $key): bool
    {
        return Cache::forget($this->key($key));
    }

    public function forgetByTag(string|array $tags): bool
    {
        $tags = is_array($tags) ? $tags : [$tags];
        Cache::tags($tags)->flush();

        return true;
    }

    public function put(string $key, mixed $value, ?int $ttl = null): bool
    {
        return Cache::put($this->key($key), $value, $ttl ?? self::DEFAULT_TTL);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::get($this->key($key), $default);
    }

    public function has(string $key): bool
    {
        return Cache::has($this->key($key));
    }

    public function flush(): bool
    {
        return Cache::flush();
    }

    private function key(string $key): string
    {
        return "{$this->prefix}:{$key}";
    }

    private function resolveTags(string $key): array
    {
        // Derive cache tags from key segments: "users:list" -> ['users']
        $segments = explode(':', $key);

        return [array_shift($segments)];
    }
}
