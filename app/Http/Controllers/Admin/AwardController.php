<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Project;
use App\Models\ProjectAward;
use App\Services\Security\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AwardController extends Controller
{
    public function __construct(private readonly AuditLogService $audit) {}
    public function index(): Response
    {
        $awards = ProjectAward::with(
            'project:id,title,slug,thumbnail,category_id',
            'project.category:id,name,color',
            'competition:id,name,name_ar,academic_year',
            'verifier:id,name'
        )
            ->orderByDesc('awarded_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ProjectAward $a) => [
                'id'               => $a->id,
                'title'            => $a->title,
                'title_ar'         => $a->title_ar,
                'issuer'           => $a->issuer,
                'rank'             => $a->rank,
                'awarded_at'       => $a->awarded_at?->toDateString(),
                'academic_year'    => $a->academic_year,
                'notes'            => $a->notes,
                'is_verified'      => $a->is_verified,
                'project'          => $a->project ? [
                    'id'       => $a->project->id,
                    'title'    => $a->project->title,
                    'slug'     => $a->project->slug,
                    'thumbnail'=> $a->project->thumbnail,
                    'category' => $a->project->category ? [
                        'id'    => $a->project->category->id,
                        'name'  => $a->project->category->name,
                        'color' => $a->project->category->color,
                    ] : null,
                ] : null,
                'competition'      => $a->competition ? [
                    'id'            => $a->competition->id,
                    'name'          => $a->competition->name,
                    'name_ar'       => $a->competition->name_ar,
                    'academic_year' => $a->competition->academic_year,
                ] : null,
                'verifier'         => $a->verifier ? ['id' => $a->verifier->id, 'name' => $a->verifier->name] : null,
                'created_at'       => $a->created_at->toDateString(),
            ]);

        $stats = [
            'total'     => ProjectAward::count(),
            'verified'  => ProjectAward::where('is_verified', true)->count(),
            'first'     => ProjectAward::where('rank', 'first')->count(),
            'second'    => ProjectAward::where('rank', 'second')->count(),
            'third'     => ProjectAward::where('rank', 'third')->count(),
            'special'   => ProjectAward::where('rank', 'special')->count(),
        ];

        $competitions = Competition::select('id', 'name', 'name_ar', 'academic_year', 'status')
            ->orderByDesc('academic_year')
            ->get();

        $projects = Project::select('id', 'title', 'slug', 'department', 'academic_year')
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return Inertia::render('Admin/Awards/Index', [
            'awards'       => $awards,
            'stats'        => $stats,
            'competitions' => $competitions,
            'projects'     => $projects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ProjectAward::class);

        $data = $request->validate([
            'project_id'    => ['required', 'uuid', 'exists:projects,id'],
            'competition_id'=> ['nullable', 'uuid', 'exists:competitions,id'],
            'title'         => ['required', 'string', 'max:200'],
            'title_ar'      => ['nullable', 'string', 'max:200'],
            'issuer'        => ['nullable', 'string', 'max:200'],
            'rank'          => ['nullable', 'string', 'in:first,second,third,honorable_mention,finalist,special'],
            'awarded_at'    => ['nullable', 'date'],
            'academic_year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'notes'         => ['nullable', 'string', 'max:1000'],
            'is_verified'   => ['boolean'],
        ]);

        if ($data['is_verified'] ?? false) {
            $data['verified_by'] = auth()->id();
        }

        $award = ProjectAward::create($data);
        $this->audit->adminAction('award_created', $award);

        return back()->with('success', 'Award created successfully.');
    }

    public function update(Request $request, ProjectAward $award): RedirectResponse
    {
        $this->authorize('update', $award);

        $data = $request->validate([
            'project_id'    => ['sometimes', 'uuid', 'exists:projects,id'],
            'competition_id'=> ['nullable', 'uuid', 'exists:competitions,id'],
            'title'         => ['sometimes', 'required', 'string', 'max:200'],
            'title_ar'      => ['nullable', 'string', 'max:200'],
            'issuer'        => ['nullable', 'string', 'max:200'],
            'rank'          => ['nullable', 'string', 'in:first,second,third,honorable_mention,finalist,special'],
            'awarded_at'    => ['nullable', 'date'],
            'academic_year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'notes'         => ['nullable', 'string', 'max:1000'],
            'is_verified'   => ['boolean'],
        ]);

        // Track who verified if toggled on
        if (($data['is_verified'] ?? false) && ! $award->is_verified) {
            $data['verified_by'] = auth()->id();
        }

        $award->update($data);
        $this->audit->adminAction('award_updated', $award);

        return back()->with('success', 'Award updated successfully.');
    }

    public function destroy(ProjectAward $award): RedirectResponse
    {
        $this->authorize('delete', $award);

        $this->audit->adminAction('award_deleted', $award);
        $award->delete();

        return back()->with('success', 'Award deleted.');
    }

    public function verify(ProjectAward $award): RedirectResponse
    {
        $this->authorize('verify', $award);

        $award->update([
            'is_verified' => true,
            'verified_by' => auth()->id(),
        ]);
        $this->audit->adminAction('award_verified', $award);

        return back()->with('success', 'Award verified.');
    }
}
