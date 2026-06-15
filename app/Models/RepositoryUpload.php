<?php

namespace App\Models;

use App\Enums\RepositoryStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RepositoryUpload extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'original_filename',
        'disk',
        'zip_path',
        'extract_path',
        'zip_size_bytes',
        'file_count',
        'status',
        'error_message',
        'file_tree',
    ];

    protected $casts = [
        'status'         => RepositoryStatus::class,
        'file_tree'      => 'array',
        'zip_size_bytes' => 'integer',
        'file_count'     => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getSizeForHumansAttribute(): string
    {
        $bytes = $this->zip_size_bytes ?? 0;
        if ($bytes === 0) return '0 B';
        $units = ['B', 'KB', 'MB', 'GB'];
        $i     = (int) floor(log($bytes, 1024));
        return round($bytes / (1024 ** $i), 2) . ' ' . ($units[$i] ?? 'B');
    }

    public function analytics(): HasOne
    {
        return $this->hasOne(RepositoryAnalytic::class, 'repository_upload_id');
    }

    public function isReady(): bool
    {
        return $this->status === RepositoryStatus::Ready;
    }
}
