<?php

namespace App\Http\Controllers;

use App\Models\RepositoryUpload;
use App\Services\Repository\CodeAnalyticsService;
use App\Services\Repository\RepositoryService;
use App\Services\Security\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RepositoryController extends Controller
{
    public function __construct(
        private readonly RepositoryService $service,
        private readonly CodeAnalyticsService $analyticsService,
        private readonly AuditLogService $audit,
    ) {}

    // ─── Pages ────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', RepositoryUpload::class);

        $uploads = RepositoryUpload::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn ($u) => [
                'id'                => $u->id,
                'name'              => $u->name,
                'original_filename' => $u->original_filename,
                'status'            => $u->status->value,
                'file_count'        => $u->file_count,
                'size_for_humans'   => $u->size_for_humans,
                'created_at'        => $u->created_at->toISOString(),
                'error_message'     => $u->error_message,
            ]);

        return Inertia::render('Repository/Index', [
            'uploads' => $uploads,
        ]);
    }

    public function show(Request $request, RepositoryUpload $repository): Response
    {
        $this->authorize('view', $repository);
        $repository->load('analytics');

        return Inertia::render('Repository/Explorer', [
            'repository' => $this->serializeRepository($repository),
        ]);
    }

    public function analytics(Request $request, RepositoryUpload $repository): JsonResponse
    {
        $this->authorize('view', $repository);

        $analytic = $repository->analytics;

        if (! $analytic && $repository->isReady()) {
            $analytic = $this->analyticsService->analyse($repository);
        }

        if (! $analytic) {
            return response()->json(['message' => 'Analytics not available.'], 404);
        }

        return response()->json([
            'total_files'        => $analytic->total_files,
            'total_lines'        => $analytic->total_lines,
            'code_lines'         => $analytic->code_lines,
            'comment_lines'      => $analytic->comment_lines,
            'blank_lines'        => $analytic->blank_lines,
            'total_bytes'        => $analytic->total_bytes,
            'total_size'         => $analytic->total_size_for_humans,
            'avg_file_size_kb'   => $analytic->avg_file_size_kb,
            'max_file_lines'     => $analytic->max_file_lines,
            'primary_language'   => $analytic->primary_language,
            'languages'          => $analytic->languages,
            'frameworks'         => $analytic->frameworks,
            'libraries'          => $analytic->libraries,
            'file_types'         => $analytic->file_types,
            'top_files'          => $analytic->top_files,
            'analysed_at'        => $analytic->analysed_at,
        ]);
    }

    // ─── API ──────────────────────────────────────────────────────────

    public function upload(Request $request): JsonResponse
    {
        $this->authorize('create', RepositoryUpload::class);

        $request->validate([
            'zip'  => ['required', 'file', 'mimes:zip', 'max:102400'],
            'name' => ['required', 'string', 'max:120'],
        ]);

        try {
            $upload = $this->service->storeZip(
                $request->file('zip'),
                $request->user()->id,
                $request->input('name')
            );

            $this->audit->fileUploaded('repository_zip', $request->file('zip')->getClientOriginalName(), $upload->id);

            return response()->json([
                'id'      => $upload->id,
                'status'  => $upload->status->value,
                'message' => 'Upload received. Processing in background.',
            ], 202);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function fileContent(Request $request, RepositoryUpload $repository): JsonResponse
    {
        $this->authorize('view', $repository);

        $request->validate([
            'path' => ['required', 'string', 'max:500'],
        ]);

        try {
            $result = $this->service->getFileContent(
                $repository,
                $request->input('path')
            );
            return response()->json($result);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function search(Request $request, RepositoryUpload $repository): JsonResponse
    {
        $this->authorize('view', $repository);

        $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:120'],
        ]);

        try {
            $results = $this->service->searchFiles($repository, $request->input('q'));
            return response()->json(['results' => $results]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, RepositoryUpload $repository): JsonResponse
    {
        $this->authorize('delete', $repository);

        $this->audit->adminAction('repository_deleted', $repository);
        $this->service->deleteUpload($repository);

        return response()->json(['message' => 'Deleted.']);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private function serializeRepository(RepositoryUpload $repository): array
    {
        $analytic = $repository->analytics;

        return [
            'id'                => $repository->id,
            'name'              => $repository->name,
            'original_filename' => $repository->original_filename,
            'status'            => $repository->status->value,
            'file_count'        => $repository->file_count,
            'size_for_humans'   => $repository->size_for_humans,
            'file_tree'         => $repository->file_tree ?? [],
            'created_at'        => $repository->created_at->toISOString(),
            'error_message'     => $repository->error_message,
            'has_analytics'     => $analytic !== null,
            'analytics'         => $analytic ? [
                'total_files'      => $analytic->total_files,
                'total_lines'      => $analytic->total_lines,
                'code_lines'       => $analytic->code_lines,
                'comment_lines'    => $analytic->comment_lines,
                'blank_lines'      => $analytic->blank_lines,
                'total_size'       => $analytic->total_size_for_humans,
                'avg_file_size_kb' => $analytic->avg_file_size_kb,
                'max_file_lines'   => $analytic->max_file_lines,
                'primary_language' => $analytic->primary_language,
                'languages'        => $analytic->languages,
                'frameworks'       => $analytic->frameworks,
                'libraries'        => $analytic->libraries,
                'file_types'       => array_slice($analytic->file_types ?? [], 0, 20),
                'top_files'        => $analytic->top_files,
                'analysed_at'      => $analytic->analysed_at,
            ] : null,
        ];
    }


}
