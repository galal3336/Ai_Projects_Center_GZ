<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $subject,
        public readonly string $message,
        public readonly string $priority = 'normal',
        public readonly ?string $actionUrl = null,
        public readonly ?string $actionLabel = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->subject)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line($this->message);

        if ($this->actionUrl && $this->actionLabel) {
            $mail->action($this->actionLabel, url($this->actionUrl));
        }

        return $mail->line('This is a message from the platform administrators.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'category'   => 'system',
            'title'      => $this->subject,
            'title_ar'   => $this->subject,
            'body'       => $this->message,
            'body_ar'    => $this->message,
            'action_url' => $this->actionUrl,
            'icon'       => 'megaphone',
            'color'      => '#8b5cf6',
            'priority'   => $this->priority,
        ];
    }
}
