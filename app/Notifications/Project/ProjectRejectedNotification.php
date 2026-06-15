<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProjectRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Project $project,
        public readonly string $rejectionNotes,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'category'     => 'review',
            'title'        => 'Project Rejected',
            'title_ar'     => 'تم رفض المشروع',
            'body'         => "Your project \"{$this->project->title}\" was not approved. Notes: {$this->rejectionNotes}",
            'body_ar'      => "لم يتم قبول مشروعك \"{$this->project->title_ar}\". الملاحظات: {$this->rejectionNotes}",
            'project_id'   => $this->project->id,
            'action_url'   => "/student/projects/{$this->project->id}/edit",
            'icon'         => 'x-circle',
            'color'        => '#ef4444',
            'priority'     => 'high',
        ];
    }
}
