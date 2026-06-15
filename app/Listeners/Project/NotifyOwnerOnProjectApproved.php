<?php

namespace App\Listeners\Project;

use App\Events\Project\ProjectApproved;
use App\Notifications\Project\ProjectApprovedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyOwnerOnProjectApproved implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(ProjectApproved $event): void
    {
        $event->project->owner->notify(new ProjectApprovedNotification($event->project));
    }
}
