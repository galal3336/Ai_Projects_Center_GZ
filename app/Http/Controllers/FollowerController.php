<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowerController extends Controller
{
    public function toggle(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        $existing = $project->followers()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $project->decrement('followers_count');
            $following = false;
        } else {
            $project->followers()->create(['user_id' => $user->id]);
            $project->increment('followers_count');
            $following = true;
        }

        $project->refresh();

        return response()->json([
            'following'       => $following,
            'followers_count' => $project->followers_count,
        ]);
    }

    public function followers(Project $project): JsonResponse
    {
        $followers = $project->followers()
            ->with('user:id,name,username,avatar')
            ->latest('created_at')
            ->paginate(30);

        return response()->json($followers);
    }

    public function index(Request $request): JsonResponse
    {
        $following = $request->user()
            ->followedProjects()
            ->with('project:id,title,slug,thumbnail,stars_count,views_count,followers_count,status,published_at')
            ->latest('created_at')
            ->paginate(20);

        return response()->json($following);
    }
}
