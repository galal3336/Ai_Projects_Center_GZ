<?php

namespace App\Listeners\Project;

use App\Events\Project\ProjectRevisionRequested;
use App\Notifications\Project\ProjectRevisionRequestedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyOwnerOnRevisionRequested implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(ProjectRevisionRequested $event): void
    {
        $event->project->owner->notify(
            new ProjectRevisionRequestedNotification($event->project, $event->revisionNotes)
        );
    }
}
