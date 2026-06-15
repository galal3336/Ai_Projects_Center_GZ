<?php

namespace App\Services\Settings;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Central service for reading/writing site settings.
 *
 * Cache strategy:
 *   - Per-key:   "site_setting:{key}"          – used by SiteSetting::get()
 *   - Per-group: "site_settings_group:{group}"  – full group map
 *   - Public:    "site_settings_public"         – all is_public settings for Inertia share
 *
 * All cache entries use the default store (Redis in production).
 */
class SiteSettingService
{
    private const TTL = null; // forever until explicitly busted

    // ─── Read helpers ─────────────────────────────────────────────────────────

    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("site_setting:{$key}", function () use ($key, $default) {
            $s = SiteSetting::where('key', $key)->first();
            return $s ? $this->cast($s->value, $s->type) : $default;
        });
    }

    /** Return an entire group as key→value map */
    public function group(string $group): array
    {
        return Cache::rememberForever("site_settings_group:{$group}", function () use ($group) {
            return SiteSetting::where('group', $group)
                ->orderBy('sort_order')
                ->get()
                ->mapWithKeys(fn ($s) => [$s->key => $this->cast($s->value, $s->type)])
                ->all();
        });
    }

    /** All is_public settings (for Inertia share / frontend) */
    public function publicSettings(): array
    {
        return Cache::rememberForever('site_settings_public', function () {
            return SiteSetting::where('is_public', true)
                ->orderBy('group')
                ->orderBy('sort_order')
                ->get()
                ->mapWithKeys(fn ($s) => [$s->key => $this->cast($s->value, $s->type)])
                ->all();
        });
    }

    // ─── Write helpers ────────────────────────────────────────────────────────

    public function set(
        string $key,
        mixed  $value,
        string $group      = 'general',
        string $type       = 'string',
        bool   $isPublic   = false,
        int    $sortOrder  = 0,
        ?int   $updatedBy  = null,
        ?string $label     = null,
    ): void {
        $stored = match ($type) {
            'json'    => is_string($value) ? $value : json_encode($value),
            'boolean' => $value ? '1' : '0',
            default   => (string) $value,
        };

        SiteSetting::updateOrCreate(
            ['group' => $group, 'key' => $key],
            array_filter([
                'value'      => $stored,
                'type'       => $type,
                'is_public'  => $isPublic,
                'sort_order' => $sortOrder,
                'updated_by' => $updatedBy,
                'label'      => $label ?? $key,
            ], fn ($v) => $v !== null)
        );

        $this->bustKey($key);
        $this->bustGroup($group);
        $this->bustPublic();
    }

    /** Bulk-save an array of [key => value] for a group (single transaction) */
    public function saveGroup(string $group, array $values, ?int $updatedBy = null): void
    {
        $existing = SiteSetting::where('group', $group)
            ->pluck('type', 'key')
            ->all();

        foreach ($values as $key => $value) {
            $type = $existing[$key] ?? 'string';

            $stored = match ($type) {
                'json'    => is_string($value) ? $value : json_encode($value),
                'boolean' => $value ? '1' : '0',
                default   => (string) $value,
            };

            SiteSetting::where('group', $group)->where('key', $key)->update([
                'value'      => $stored,
                'updated_by' => $updatedBy,
            ]);

            $this->bustKey($key);
        }

        $this->bustGroup($group);
        $this->bustPublic();
    }

    // ─── File upload ──────────────────────────────────────────────────────────

    /** Store a site asset (logo/favicon) and save its public URL to settings */
    public function storeAsset(
        UploadedFile $file,
        string       $key,
        string       $group      = 'branding',
        bool         $isPublic   = true,
        ?int         $updatedBy  = null,
    ): string {
        // Delete old file if set
        $old = $this->get($key);
        if ($old && Str::startsWith($old, '/storage/')) {
            Storage::disk('public')->delete(Str::after($old, '/storage/'));
        }

        $ext      = $file->getClientOriginalExtension();
        $filename = Str::slug($key) . '-' . Str::random(8) . '.' . $ext;
        $path     = $file->storeAs("site/{$group}", $filename, 'public');
        $url      = '/storage/' . $path;

        $this->set($key, $url, $group, 'string', $isPublic, 0, $updatedBy, $key);

        return $url;
    }

    // ─── Cache invalidation ───────────────────────────────────────────────────

    public function bustKey(string $key): void
    {
        Cache::forget("site_setting:{$key}");
    }

    public function bustGroup(string $group): void
    {
        Cache::forget("site_settings_group:{$group}");
    }

    public function bustPublic(): void
    {
        Cache::forget('site_settings_public');
    }

    public function bustAll(): void
    {
        // Bust every known group
        foreach (['general', 'branding', 'seo', 'contact', 'social', 'footer', 'homepage'] as $g) {
            $this->bustGroup($g);
        }
        $this->bustPublic();
    }

    // ─── Casting ──────────────────────────────────────────────────────────────

    private function cast(mixed $value, string $type): mixed
    {
        return match ($type) {
            'integer' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json'    => json_decode($value, true),
            default   => $value,
        };
    }
}
