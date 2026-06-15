<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
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
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->locale ?? config('app.locale', 'en');

        return (new MailMessage)
            ->subject('Revision Requested — ' . $this->project->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line("Your project \"{$this->project->title}\" requires some revisions before it can be approved.")
            ->line("**Reviewer notes:** {$this->revisionNotes}")
            ->action('Edit Project', route('student.projects.edit', [
                'locale'  => $locale,
                'project' => $this->project->id,
            ]))
            ->line('Please address the notes above and resubmit.');
    }

    public function toArray(object $notifiable): array
    {
        $locale = $notifiable->locale ?? config('app.locale', 'en');

        return [
            'category'     => 'review',
            'title'        => 'Revision Requested',
            'title_ar'     => 'مطلوب مراجعة',
            'body'         => "Your project \"{$this->project->title}\" requires revision. Notes: {$this->revisionNotes}",
            'body_ar'      => "مشروعك \"{$this->project->title_ar}\" يحتاج إلى مراجعة. الملاحظات: {$this->revisionNotes}",
            'project_id'   => $this->project->id,
            'action_url'   => route('student.projects.edit', [
                'locale'  => $locale,
                'project' => $this->project->id,
            ]),
            'icon'         => 'alert-circle',
            'color'        => '#f59e0b',
            'priority'     => 'high',
        ];
    }
}
