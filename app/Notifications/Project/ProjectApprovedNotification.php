<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProjectApprovedNotification extends Notification implements ShouldQueue
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
            'title'        => 'Project Approved',
            'title_ar'     => 'تم قبول المشروع',
            'body'         => "Your project \"{$this->project->title}\" has been approved.",
            'body_ar'      => "تم قبول مشروعك \"{$this->project->title_ar}\".",
            'project_id'   => $this->project->id,
            'action_url'   => "/projects/{$this->project->slug}",
            'icon'         => 'check-circle',
            'color'        => '#22c55e',
            'priority'     => 'high',
        ];
    }
}
