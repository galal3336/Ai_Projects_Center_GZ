<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function toggle(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        $existing = $project->bookmarks()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $project->decrement('bookmarks_count');
            $bookmarked = false;
        } else {
            $project->bookmarks()->create(['user_id' => $user->id]);
            $project->increment('bookmarks_count');
            $bookmarked = true;
        }

        $project->refresh();

        return response()->json([
            'bookmarked'      => $bookmarked,
            'bookmarks_count' => $project->bookmarks_count,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $bookmarks = $request->user()
            ->bookmarkedProjects()
            ->with('project:id,title,slug,thumbnail,stars_count,views_count,bookmarks_count,status,published_at')
            ->latest('created_at')
            ->paginate(20);

        return response()->json($bookmarks);
    }
}
