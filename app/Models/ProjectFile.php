<?php

namespace App\Models;

use App\Enums\ProjectFileType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectFile extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id', 'type', 'label', 'label_ar',
        'path', 'disk', 'original_name', 'mime_type',
        'size_bytes', 'extension', 'version_tag',
        'is_public', 'downloads_count', 'sort_order', 'uploaded_by',
    ];

    protected $casts = [
        'type'            => ProjectFileType::class,
        'is_public'       => 'boolean',
        'downloads_count' => 'integer',
        'size_bytes'      => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getSizeForHumansAttribute(): string
    {
        $bytes = $this->size_bytes ?? 0;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i     = (int) floor(log($bytes, 1024));

        return round($bytes / (1024 ** $i), 2) . ' ' . ($units[$i] ?? 'B');
    }
}
