<?php

namespace App\Contracts\Services;

interface CacheServiceInterface
{
    public function remember(string $key, \Closure $callback, ?int $ttl = null): mixed;
    public function forget(string $key): bool;
    public function forgetByTag(string|array $tags): bool;
    public function put(string $key, mixed $value, ?int $ttl = null): bool;
    public function get(string $key, mixed $default = null): mixed;
    public function has(string $key): bool;
    public function flush(): bool;
}
