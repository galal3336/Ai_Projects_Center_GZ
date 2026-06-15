<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->paginate(20)
            ->through(fn ($n) => $this->format($n));

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unread_count'  => $user->unreadNotifications()->count(),
        ]);
    }

    public function fetch(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn ($n) => $this->format($n));

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $user->unreadNotifications()->count(),
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['unread_count' => 0]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $request->user()->notifications()->delete();

        return response()->json(['unread_count' => 0]);
    }

    private function format(\Illuminate\Notifications\DatabaseNotification $n): array
    {
        $data = $n->data;

        return [
            'id'         => $n->id,
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
            'read_at'    => $n->read_at?->toIso8601String(),
            'created_at' => $n->created_at->toIso8601String(),
        ];
    }
}
