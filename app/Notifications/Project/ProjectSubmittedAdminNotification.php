<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProjectSubmittedAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Project $project) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'category'     => 'review',
            'title'        => 'New Project Submission',
            'title_ar'     => 'تقديم مشروع جديد',
            'body'         => "New project awaiting review: \"{$this->project->title}\" by {$this->project->owner->name}.",
            'body_ar'      => "مشروع جديد بانتظار المراجعة: \"{$this->project->title_ar}\" بواسطة {$this->project->owner->name}.",
            'project_id'   => $this->project->id,
            'action_url'   => "/admin/projects/{$this->project->id}/review",
            'icon'         => 'inbox',
            'color'        => '#6366f1',
            'priority'     => 'normal',
        ];
    }
}
