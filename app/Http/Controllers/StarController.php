<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StarController extends Controller
{
    public function toggle(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        $existing = $project->stars()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $project->decrement('stars_count');
            $starred = false;
        } else {
            $project->stars()->create(['user_id' => $user->id]);
            $project->increment('stars_count');
            $starred = true;
        }

        $project->refresh();

        return response()->json([
            'starred'     => $starred,
            'stars_count' => $project->stars_count,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $starred = $request->user()
            ->starredProjects()
            ->with('project:id,title,slug,thumbnail,stars_count,views_count,status,published_at')
            ->latest('created_at')
            ->paginate(20);

        return response()->json($starred);
    }
}
