<?php

namespace App\Models;

use App\Enums\AiFeature;
use App\Enums\AiStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiResult extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id', 'feature', 'sub_type', 'status',
        'result', 'error_message', 'model',
        'input_tokens', 'output_tokens', 'processing_ms',
        'requested_by', 'started_at', 'completed_at',
    ];

    protected $casts = [
        'feature'      => AiFeature::class,
        'status'       => AiStatus::class,
        'result'       => 'array',
        'started_at'   => 'datetime',
        'completed_at' => 'datetime',
    ];

    // ─── Relationships ────────────────────────────────────────────────────

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    // ─── Scopes ───────────────────────────────────────────────────────────

    public function scopeForProject($query, string $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', AiStatus::Completed->value);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    public function isPending(): bool    { return $this->status === AiStatus::Pending; }
    public function isProcessing(): bool { return $this->status === AiStatus::Processing; }
    public function isCompleted(): bool  { return $this->status === AiStatus::Completed; }
    public function isFailed(): bool     { return $this->status === AiStatus::Failed; }

    public function markProcessing(): void
    {
        $this->update(['status' => AiStatus::Processing, 'started_at' => now()]);
    }

    public function markCompleted(array $result, array $meta = []): void
    {
        $this->update([
            'status'        => AiStatus::Completed,
            'result'        => $result,
            'completed_at'  => now(),
            'processing_ms' => $this->started_at
                ? (int) $this->started_at->diffInMilliseconds(now())
                : null,
            ...$meta,
        ]);
    }

    public function markFailed(string $error): void
    {
        $this->update([
            'status'        => AiStatus::Failed,
            'error_message' => $error,
            'completed_at'  => now(),
        ]);
    }
}
