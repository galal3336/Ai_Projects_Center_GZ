<?php

namespace App\Listeners\Project;

use App\Events\Project\ProjectPublished;
use App\Notifications\Project\ProjectPublishedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyOwnerOnProjectPublished implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(ProjectPublished $event): void
    {
        $event->project->owner->notify(new ProjectPublishedNotification($event->project));
    }
}
