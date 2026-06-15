<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepositoryAnalytic extends Model
{
    use HasUuids;

    protected $table = 'repository_analytics';

    protected $fillable = [
        'id',
        'repository_upload_id',
        'total_files',
        'total_lines',
        'code_lines',
        'comment_lines',
        'blank_lines',
        'total_bytes',
        'languages',
        'frameworks',
        'libraries',
        'file_types',
        'top_files',
        'primary_language',
        'avg_file_size_kb',
        'max_file_lines',
        'analysed_at',
    ];

    protected $casts = [
        'languages'        => 'array',
        'frameworks'       => 'array',
        'libraries'        => 'array',
        'file_types'       => 'array',
        'top_files'        => 'array',
        'total_files'      => 'integer',
        'total_lines'      => 'integer',
        'code_lines'       => 'integer',
        'comment_lines'    => 'integer',
        'blank_lines'      => 'integer',
        'total_bytes'      => 'integer',
        'avg_file_size_kb' => 'decimal:2',
        'max_file_lines'   => 'integer',
    ];

    public function repository(): BelongsTo
    {
        return $this->belongsTo(RepositoryUpload::class, 'repository_upload_id');
    }

    public function getTotalSizeForHumansAttribute(): string
    {
        $bytes = $this->total_bytes ?? 0;
        if ($bytes === 0) return '0 B';
        $units = ['B', 'KB', 'MB', 'GB'];
        $i     = (int) floor(log($bytes, 1024));
        return round($bytes / (1024 ** $i), 2) . ' ' . ($units[$i] ?? 'B');
    }
}
