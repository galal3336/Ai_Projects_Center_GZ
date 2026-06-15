<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectBookmark;
use App\Models\ProjectFollower;
use App\Models\ProjectStar;
use App\Models\User;
use Illuminate\Database\Seeder;

class InteractionSeeder extends Seeder
{
    public function run(): void
    {
        $students        = User::whereHas('roles', fn ($q) => $q->where('name', 'student'))->get();
        $publishedProjects = Project::published()->get();

        foreach ($publishedProjects as $project) {
            // Star: random subset of students, excluding the owner
            $starUsers = $students->where('id', '!=', $project->owner_id)
                                  ->random(min($students->count() - 1, rand(2, 8)));

            foreach ($starUsers as $user) {
                ProjectStar::firstOrCreate(
                    ['project_id' => $project->id, 'user_id' => $user->id],
                    ['project_id' => $project->id, 'user_id' => $user->id]
                );
            }

            // Bookmark: smaller subset
            $bookmarkUsers = $students->where('id', '!=', $project->owner_id)
                                      ->random(min($students->count() - 1, rand(1, 5)));

            foreach ($bookmarkUsers as $user) {
                ProjectBookmark::firstOrCreate(
                    ['project_id' => $project->id, 'user_id' => $user->id],
                    ['project_id' => $project->id, 'user_id' => $user->id]
                );
            }

            // Follow: smallest subset
            $followUsers = $students->where('id', '!=', $project->owner_id)
                                    ->random(min($students->count() - 1, rand(1, 4)));

            foreach ($followUsers as $user) {
                ProjectFollower::firstOrCreate(
                    ['project_id' => $project->id, 'user_id' => $user->id],
                    ['project_id' => $project->id, 'user_id' => $user->id]
                );
            }

            // Sync denormalized counts from actual rows
            $project->update([
                'stars_count'     => $project->stars()->count(),
                'bookmarks_count' => $project->bookmarks()->count(),
                'followers_count' => $project->followers()->count(),
            ]);
        }
    }
}
