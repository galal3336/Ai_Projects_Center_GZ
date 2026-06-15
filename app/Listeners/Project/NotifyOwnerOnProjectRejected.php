<?php

namespace App\Listeners\Project;

use App\Events\Project\ProjectRejected;
use App\Notifications\Project\ProjectRejectedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyOwnerOnProjectRejected implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(ProjectRejected $event): void
    {
        $event->project->owner->notify(
            new ProjectRejectedNotification($event->project, $event->rejectionNotes)
        );
    }
}
