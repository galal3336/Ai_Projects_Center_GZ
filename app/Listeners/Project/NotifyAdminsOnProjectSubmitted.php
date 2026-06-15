<?php

namespace App\Listeners\Project;

use App\Events\Project\ProjectSubmitted;
use App\Models\User;
use App\Notifications\Project\ProjectSubmittedAdminNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyAdminsOnProjectSubmitted implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(ProjectSubmitted $event): void
    {
        User::role(['super_admin', 'admin'])->each(
            fn (User $admin) => $admin->notify(new ProjectSubmittedAdminNotification($event->project))
        );
    }
}
