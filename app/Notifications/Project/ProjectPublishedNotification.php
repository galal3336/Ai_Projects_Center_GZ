<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProjectPublishedNotification extends Notification implements ShouldQueue
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
            'category'     => 'project',
            'title'        => 'Project Published',
            'title_ar'     => 'تم نشر المشروع',
            'body'         => "Your project \"{$this->project->title}\" is now live on the platform.",
            'body_ar'      => "مشروعك \"{$this->project->title_ar}\" متاح الآن على المنصة.",
            'project_id'   => $this->project->id,
            'action_url'   => "/projects/{$this->project->slug}",
            'icon'         => 'globe',
            'color'        => '#3b82f6',
            'priority'     => 'normal',
        ];
    }
}
