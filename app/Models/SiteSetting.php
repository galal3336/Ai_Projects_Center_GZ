<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = [
        'group', 'key', 'value', 'type',
        'label', 'description', 'is_public',
        'is_encrypted', 'sort_order', 'updated_by',
    ];

    protected $casts = [
        'is_public'    => 'boolean',
        'is_encrypted' => 'boolean',
    ];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // ─── Static helpers ───────────────────────────────────────────────

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("site_setting:{$key}", function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            if (! $setting) {
                return $default;
            }

            return static::cast($setting->value, $setting->type);
        });
    }

    public static function set(string $key, mixed $value, string $group = 'general'): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group],
        );

        Cache::forget("site_setting:{$key}");
    }

    public static function group(string $group): \Illuminate\Support\Collection
    {
        return Cache::rememberForever("site_settings_group:{$group}", function () use ($group) {
            return static::where('group', $group)
                ->orderBy('sort_order')
                ->get()
                ->mapWithKeys(fn ($s) => [$s->key => static::cast($s->value, $s->type)]);
        });
    }

    private static function cast(mixed $value, string $type): mixed
    {
        return match($type) {
            'integer' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json'    => json_decode($value, true),
            default   => $value,
        };
    }
}
