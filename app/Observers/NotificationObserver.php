<?php

namespace App\Observers;

use App\Events\NotificationSent;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Cache;

class NotificationObserver
{
    public function created(DatabaseNotification $notification): void
    {
        $notifiable = $notification->notifiable;

        if (! ($notifiable instanceof \App\Models\User)) {
            return;
        }

        // Bust the cached unread count so the next page load reflects the new notification
        $this->bustUnreadCache($notifiable->id);

        $data = $notification->data;

        $formatted = [
            'id'         => $notification->id,
            'category'   => $data['category'] ?? 'system',
            'title'      => $data['title'] ?? '',
            'title_ar'   => $data['title_ar'] ?? $data['title'] ?? '',
            'body'       => $data['body'] ?? null,
            'body_ar'    => $data['body_ar'] ?? $data['body'] ?? null,
            'action_url' => $data['action_url'] ?? null,
            'icon'       => $data['icon'] ?? 'bell',
            'color'      => $data['color'] ?? '#6366f1',
            'priority'   => $data['priority'] ?? 'normal',
            'project_id' => $data['project_id'] ?? null,
            'read_at'    => null,
            'created_at' => $notification->created_at->toIso8601String(),
        ];

        $unreadCount = $notifiable->unreadNotifications()->count();

        broadcast(new NotificationSent($notifiable->id, $formatted, $unreadCount));
    }

    public function updated(DatabaseNotification $notification): void
    {
        $notifiable = $notification->notifiable;

        if ($notifiable instanceof \App\Models\User) {
            $this->bustUnreadCache($notifiable->id);
        }
    }

    public function deleted(DatabaseNotification $notification): void
    {
        $notifiable = $notification->notifiable;

        if ($notifiable instanceof \App\Models\User) {
            $this->bustUnreadCache($notifiable->id);
        }
    }

    private function bustUnreadCache(int $userId): void
    {
        Cache::forget("user:{$userId}:unread_notifications");
    }
}
