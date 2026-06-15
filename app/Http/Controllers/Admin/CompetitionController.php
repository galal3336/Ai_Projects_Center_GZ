<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CompetitionStatus;
use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionController extends Controller
{
    public function index(): Response
    {
        $competitions = Competition::withCount('projects')
            ->with('creator:id,name')
            ->orderByDesc('start_date')
            ->get()
            ->map(fn (Competition $c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'name_ar'        => $c->name_ar,
                'slug'           => $c->slug,
                'description'    => $c->description,
                'description_ar' => $c->description_ar,
                'organizer'      => $c->organizer,
                'organizer_logo' => $c->organizer_logo,
                'website_url'    => $c->website_url,
                'cover_image'    => $c->cover_image,
                'level'          => $c->level,
                'status'         => $c->status->value,
                'start_date'     => $c->start_date?->toDateString(),
                'end_date'       => $c->end_date?->toDateString(),
                'academic_year'  => $c->academic_year,
                'is_featured'    => $c->is_featured,
                'sort_order'     => $c->sort_order,
                'projects_count' => $c->projects_count,
                'creator'        => $c->creator ? ['id' => $c->creator->id, 'name' => $c->creator->name] : null,
                'created_at'     => $c->created_at->toDateString(),
            ]);

        $stats = [
            'total'         => Competition::count(),
            'active'        => Competition::where('status', CompetitionStatus::Active)->count(),
            'upcoming'      => Competition::where('status', CompetitionStatus::Upcoming)->count(),
            'completed'     => Competition::where('status', CompetitionStatus::Completed)->count(),
            'total_projects'=> \DB::table('competition_project')->count(),
        ];

        return Inertia::render('Admin/Competitions/Index', [
            'competitions' => $competitions,
            'stats'        => $stats,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:200'],
            'name_ar'        => ['nullable', 'string', 'max:200'],
            'description'    => ['nullable', 'string', 'max:2000'],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'organizer'      => ['nullable', 'string', 'max:200'],
            'website_url'    => ['nullable', 'url', 'max:255'],
            'level'          => ['required', 'string', 'in:university,national,regional,international'],
            'status'         => ['required', 'string', 'in:upcoming,active,completed,cancelled'],
            'start_date'     => ['nullable', 'date'],
            'end_date'       => ['nullable', 'date', 'after_or_equal:start_date'],
            'academic_year'  => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'is_featured'    => ['boolean'],
            'sort_order'     => ['nullable', 'integer', 'min:0'],
        ]);

        $data['slug']       = Str::slug($data['name']) . '-' . ($data['academic_year'] ?? now()->year);
        $data['created_by'] = auth()->id();

        // Ensure slug uniqueness
        $base = $data['slug'];
        $i    = 1;
        while (Competition::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $base . '-' . $i++;
        }

        Competition::create($data);

        return back()->with('success', 'Competition created successfully.');
    }

    public function update(Request $request, Competition $competition): RedirectResponse
    {
        $data = $request->validate([
            'name'           => ['sometimes', 'required', 'string', 'max:200'],
            'name_ar'        => ['nullable', 'string', 'max:200'],
            'description'    => ['nullable', 'string', 'max:2000'],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'organizer'      => ['nullable', 'string', 'max:200'],
            'website_url'    => ['nullable', 'url', 'max:255'],
            'level'          => ['sometimes', 'string', 'in:university,national,regional,international'],
            'status'         => ['sometimes', 'string', 'in:upcoming,active,completed,cancelled'],
            'start_date'     => ['nullable', 'date'],
            'end_date'       => ['nullable', 'date', 'after_or_equal:start_date'],
            'academic_year'  => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'is_featured'    => ['boolean'],
            'sort_order'     => ['nullable', 'integer', 'min:0'],
        ]);

        $competition->update($data);

        return back()->with('success', 'Competition updated successfully.');
    }

    public function destroy(Competition $competition): RedirectResponse
    {
        $competition->delete();

        return back()->with('success', 'Competition deleted.');
    }

    // ─── Project linking ──────────────────────────────────────────────────────

    public function projects(Competition $competition): JsonResponse
    {
        $entries = $competition->projects()
            ->with('owner:id,name', 'category:id,name,color')
            ->orderByPivot('submission_number')
            ->get()
            ->map(fn (Project $p) => [
                'id'                => $p->id,
                'title'             => $p->title,
                'slug'              => $p->slug,
                'thumbnail'         => $p->thumbnail,
                'department'        => $p->department,
                'academic_year'     => $p->academic_year,
                'owner'             => $p->owner ? ['id' => $p->owner->id, 'name' => $p->owner->name] : null,
                'category'          => $p->category ? ['id' => $p->category->id, 'name' => $p->category->name, 'color' => $p->category->color] : null,
                'submission_status' => $p->pivot->submission_status,
                'award_rank'        => $p->pivot->award_rank,
                'submission_number' => $p->pivot->submission_number,
                'submission_notes'  => $p->pivot->submission_notes,
                'submitted_at'      => $p->pivot->submitted_at,
            ]);

        return response()->json($entries);
    }

    public function attachProject(Request $request, Competition $competition): JsonResponse
    {
        $data = $request->validate([
            'project_id'        => ['required', 'uuid', 'exists:projects,id'],
            'submission_status' => ['string', 'in:submitted,shortlisted,finalist,winner,disqualified,withdrawn'],
            'submission_notes'  => ['nullable', 'string', 'max:1000'],
        ]);

        if ($competition->projects()->where('project_id', $data['project_id'])->exists()) {
            return response()->json(['message' => 'Project already linked.'], 422);
        }

        $number = $competition->projects()->count() + 1;

        $competition->projects()->attach($data['project_id'], [
            'submission_status' => $data['submission_status'] ?? 'submitted',
            'submission_notes'  => $data['submission_notes'] ?? null,
            'submission_number' => $number,
            'submitted_at'      => now(),
        ]);

        $competition->increment('projects_count');

        return response()->json(['message' => 'Project linked.', 'submission_number' => $number]);
    }

    public function detachProject(Request $request, Competition $competition): JsonResponse
    {
        $data = $request->validate([
            'project_id' => ['required', 'uuid', 'exists:projects,id'],
        ]);

        $competition->projects()->detach($data['project_id']);
        $competition->decrement('projects_count');

        return response()->json(['message' => 'Project removed.']);
    }

    public function updateProjectRank(Request $request, Competition $competition): JsonResponse
    {
        $data = $request->validate([
            'project_id'        => ['required', 'uuid', 'exists:projects,id'],
            'submission_status' => ['sometimes', 'string', 'in:submitted,shortlisted,finalist,winner,disqualified,withdrawn'],
            'award_rank'        => ['nullable', 'string', 'in:first,second,third,honorable_mention,finalist,special'],
            'submission_notes'  => ['nullable', 'string', 'max:1000'],
        ]);

        $competition->projects()->updateExistingPivot($data['project_id'], [
            'submission_status' => $data['submission_status'] ?? null,
            'award_rank'        => $data['award_rank'] ?? null,
            'submission_notes'  => $data['submission_notes'] ?? null,
            'evaluated_at'      => now(),
            'evaluated_by'      => auth()->id(),
        ] + ($data['submission_status'] !== null ? [] : []));

        return response()->json(['message' => 'Rank updated.']);
    }

    // ─── Searchable projects (for attaching) ─────────────────────────────────

    public function searchProjects(Request $request, Competition $competition): JsonResponse
    {
        $q = $request->string('q');

        $alreadyLinked = $competition->projects()->pluck('projects.id');

        $projects = Project::select('id', 'title', 'slug', 'thumbnail', 'department', 'academic_year', 'owner_id', 'category_id')
            ->with('owner:id,name', 'category:id,name,color')
            ->whereNotIn('id', $alreadyLinked)
            ->where(fn ($query) => $query
                ->where('title', 'like', "%{$q}%")
                ->orWhere('title_ar', 'like', "%{$q}%")
                ->orWhere('department', 'like', "%{$q}%")
            )
            ->limit(20)
            ->get()
            ->map(fn (Project $p) => [
                'id'           => $p->id,
                'title'        => $p->title,
                'slug'         => $p->slug,
                'thumbnail'    => $p->thumbnail,
                'department'   => $p->department,
                'academic_year'=> $p->academic_year,
                'owner'        => $p->owner ? ['id' => $p->owner->id, 'name' => $p->owner->name] : null,
                'category'     => $p->category ? ['id' => $p->category->id, 'name' => $p->category->name, 'color' => $p->category->color] : null,
            ]);

        return response()->json($projects);
    }
}
