<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProjectRevisionRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Project $project,
        public readonly string $revisionNotes,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'category'     => 'review',
            'title'        => 'Revision Requested',
            'title_ar'     => 'مطلوب مراجعة',
            'body'         => "Your project \"{$this->project->title}\" requires revision. Notes: {$this->revisionNotes}",
            'body_ar'      => "مشروعك \"{$this->project->title_ar}\" يحتاج إلى مراجعة. الملاحظات: {$this->revisionNotes}",
            'project_id'   => $this->project->id,
            'action_url'   => "/student/projects/{$this->project->id}/edit",
            'icon'         => 'alert-circle',
            'color'        => '#f59e0b',
            'priority'     => 'high',
        ];
    }
}
