<?php

namespace App\Events\Project;

use App\Models\Project;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectArchived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Project $project,
    ) {}
}
