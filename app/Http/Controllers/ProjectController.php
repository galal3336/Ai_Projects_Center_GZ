<?php

namespace App\Http\Controllers;

use App\Contracts\Services\ProjectServiceInterface;
use App\DTOs\ProjectDTO;
use App\DTOs\ProjectFilterDTO;
use App\Http\Requests\Project\ApproveProjectRequest;
use App\Http\Requests\Project\RejectProjectRequest;
use App\Http\Requests\Project\RequestRevisionRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Jobs\TrackProjectView;
use App\Models\Project;
use App\Services\Security\AuditLogService;
use App\Services\SeoMetaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(
        protected ProjectServiceInterface $projectService,
        protected SeoMetaService $seo,
        protected AuditLogService $audit,
    ) {}

    // ─── Public ───────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $filter   = ProjectFilterDTO::fromRequest($request->all());
        $projects = $this->projectService->getPublicProjects($filter);
        $canReview = $request->user()?->can('review', Project::class) ?? false;

        return Inertia::render('Projects/Index', [
            'projects' => ProjectResource::collection($projects)->additional(['can_review' => $canReview]),
            'filters'  => $request->only(['search', 'category_id', 'academic_year', 'department', 'sort', 'direction']),
            'seo'      => $this->seo->forProjectsIndex($request->input('category_name')),
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $project = $this->projectService->getBySlug($slug);

        $this->authorize('view', $project);

        // Dispatch view tracking asynchronously — keeps p99 latency off the request path
        TrackProjectView::dispatch(
            $project->id,
            $request->user()?->id,
            hash('sha256', $request->ip()),
            $this->normaliseReferrer($request->headers->get('referer')),
            $request->headers->get('CF-IPCountry') ?? $request->headers->get('X-Country-Code'),
            $this->parseBrowser($request->userAgent() ?? ''),
        );

        // Eager-load relations needed for rich schema
        $project->loadMissing(['owner', 'category', 'technologies', 'awards']);

        return Inertia::render('Projects/Show', [
            'project' => new ProjectResource($project),
            'seo'     => $this->seo->forProject($project),
        ]);
    }

    private function normaliseReferrer(?string $referer): ?string
    {
        if (! $referer) return null;
        $host = parse_url($referer, PHP_URL_HOST);
        return $host ? strtolower($host) : null;
    }

    private function parseBrowser(string $ua): string
    {
        return match (true) {
            str_contains($ua, 'Edg/')     => 'Edge',
            str_contains($ua, 'OPR/')     => 'Opera',
            str_contains($ua, 'Chrome/')  => 'Chrome',
            str_contains($ua, 'Firefox/') => 'Firefox',
            str_contains($ua, 'Safari/')  => 'Safari',
            default                        => 'Other',
        };
    }

    // ─── Student ──────────────────────────────────────────────────────

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('Student/Projects/Create');
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = $this->projectService->create(
            $request->user(),
            ProjectDTO::fromArray($request->validated()),
        );

        return redirect()
            ->route('student.projects.show', $project->id)
            ->with('success', __('projects.created'));
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('Student/Projects/Edit', [
            'project' => new ProjectResource($project->load(['technologies', 'languages', 'competitions'])),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $this->projectService->update($project, ProjectDTO::fromArray($request->validated()));

        return redirect()
            ->back()
            ->with('success', __('projects.updated'));
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $this->projectService->delete($project);

        return redirect()
            ->route('student.projects.index')
            ->with('success', __('projects.deleted'));
    }

    public function submit(Project $project): RedirectResponse
    {
        $this->authorize('submit', $project);

        $this->projectService->submit($project);

        return redirect()
            ->back()
            ->with('success', __('projects.submitted'));
    }

    // ─── Admin ────────────────────────────────────────────────────────

    public function adminIndex(Request $request): Response
    {
        $this->authorize('review', Project::class);

        $filter = ProjectFilterDTO::fromRequest($request->all());
        $projects = $this->projectService->getAdminProjects($filter);

        return Inertia::render('Admin/Projects/Index', [
            'projects' => ProjectResource::collection($projects),
            'filters'  => $request->only(['search', 'category_id', 'status', 'owner_id', 'sort', 'direction']),
        ]);
    }

    public function pendingReview(): Response
    {
        $this->authorize('review', Project::class);

        $projects = $this->projectService->getPendingReview();

        return Inertia::render('Admin/Projects/PendingReview', [
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    public function review(Project $project): Response
    {
        $this->authorize('review', Project::class);

        return Inertia::render('Admin/Projects/Review', [
            'project' => new ProjectResource($project->load([
                'owner', 'category', 'technologies', 'languages',
                'members.user', 'awards', 'links', 'images',
            ])),
        ]);
    }

    public function approve(ApproveProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('approve', $project);
        $oldStatus = $project->status->value;

        $this->projectService->approve($project, $request->user());
        $this->audit->projectStatusChanged($project, $oldStatus, 'approved');

        return redirect()
            ->route('admin.projects.pending')
            ->with('success', __('projects.approved'));
    }

    public function reject(RejectProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('reject', $project);
        $oldStatus = $project->status->value;

        $this->projectService->reject($project, $request->user(), $request->validated('rejection_notes'));
        $this->audit->projectStatusChanged($project, $oldStatus, 'rejected');

        return redirect()
            ->route('admin.projects.pending')
            ->with('success', __('projects.rejected'));
    }

    public function requestRevision(RequestRevisionRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('requestRevision', $project);
        $oldStatus = $project->status->value;

        $this->projectService->requestRevision($project, $request->user(), $request->validated('revision_notes'));
        $this->audit->projectStatusChanged($project, $oldStatus, 'revision');

        return redirect()
            ->route('admin.projects.pending')
            ->with('success', __('projects.revision_requested'));
    }

    public function publish(Project $project): RedirectResponse
    {
        $this->authorize('publish', $project);
        $oldStatus = $project->status->value;

        $this->projectService->publish($project);
        $this->audit->projectStatusChanged($project, $oldStatus, 'published');

        return redirect()
            ->back()
            ->with('success', __('projects.published'));
    }

    public function archive(Project $project): RedirectResponse
    {
        $this->authorize('archive', $project);
        $oldStatus = $project->status->value;

        $this->projectService->archive($project);
        $this->audit->projectStatusChanged($project, $oldStatus, 'archived');

        return redirect()
            ->back()
            ->with('success', __('projects.archived'));
    }
}
