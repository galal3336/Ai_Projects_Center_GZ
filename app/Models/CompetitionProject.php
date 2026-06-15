<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CompetitionProject extends Pivot
{
    use HasUuids;

    protected $table = 'competition_project';

    public $incrementing = false;

    protected $fillable = [
        'competition_id', 'project_id',
        'submission_status', 'award_rank',
        'submission_number', 'submission_notes',
        'submitted_at', 'evaluated_at', 'evaluated_by',
    ];

    protected $casts = [
        'submitted_at'  => 'datetime',
        'evaluated_at'  => 'datetime',
    ];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}
