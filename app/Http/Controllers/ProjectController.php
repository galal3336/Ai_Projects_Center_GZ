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
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(protected ProjectServiceInterface $projectService) {}

    // ─── Public ───────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $filter = ProjectFilterDTO::fromRequest($request->all());
        $projects = $this->projectService->getPublicProjects($filter);

        return Inertia::render('Projects/Index', [
            'projects' => ProjectResource::collection($projects),
            'filters'  => $request->only(['search', 'category_id', 'academic_year', 'department', 'sort', 'direction']),
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $project = $this->projectService->getBySlug($slug);

        $this->authorize('view', $project);

        $this->projectService->incrementViews($project, [
            'user_id'  => $request->user()?->id,
            'ip_hash'  => hash('sha256', $request->ip()),
            'referrer' => $this->normaliseReferrer($request->headers->get('referer')),
            'country'  => $request->headers->get('CF-IPCountry')  // Cloudflare header; null otherwise
                       ?? $request->headers->get('X-Country-Code'),
            'browser'  => $this->parseBrowser($request->userAgent() ?? ''),
        ]);

        return Inertia::render('Projects/Show', [
            'project' => new ProjectResource($project),
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
        $this->projectService->approve($project, $request->user());

        return redirect()
            ->route('admin.projects.pending')
            ->with('success', __('projects.approved'));
    }

    public function reject(RejectProjectRequest $request, Project $project): RedirectResponse
    {
        $this->projectService->reject($project, $request->user(), $request->validated('rejection_notes'));

        return redirect()
            ->route('admin.projects.pending')
            ->with('success', __('projects.rejected'));
    }

    public function requestRevision(RequestRevisionRequest $request, Project $project): RedirectResponse
    {
        $this->projectService->requestRevision($project, $request->user(), $request->validated('revision_notes'));

        return redirect()
            ->route('admin.projects.pending')
            ->with('success', __('projects.revision_requested'));
    }

    public function publish(Project $project): RedirectResponse
    {
        $this->authorize('publish', $project);

        $this->projectService->publish($project);

        return redirect()
            ->back()
            ->with('success', __('projects.published'));
    }

    public function archive(Project $project): RedirectResponse
    {
        $this->authorize('archive', $project);

        $this->projectService->archive($project);

        return redirect()
            ->back()
            ->with('success', __('projects.archived'));
    }
}
