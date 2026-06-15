<?php

namespace App\Http\Controllers;

use App\Enums\AiFeature;
use App\Enums\AiStatus;
use App\Jobs\Ai\FindSimilarProjects;
use App\Jobs\Ai\GenerateAiSummary;
use App\Jobs\Ai\GenerateAiTags;
use App\Jobs\Ai\RunAiJudge;
use App\Models\AiResult;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AiController extends Controller
{
    /**
     * Dispatch an AI feature job for a project.
     * POST /api/ai/{project}/dispatch
     */
    public function dispatch(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'feature'  => ['required', Rule::enum(AiFeature::class)],
            'sub_type' => ['nullable', 'string', Rule::in(['executive', 'technical', 'business'])],
        ]);

        $feature = AiFeature::from($validated['feature']);
        $subType = $validated['sub_type'] ?? null;

        // For summary, sub_type is required
        if ($feature === AiFeature::Summary && ! $subType) {
            return response()->json(['message' => 'sub_type is required for summary feature.'], 422);
        }

        // Check for an in-flight job (pending or processing) — don't double-dispatch
        $inFlight = AiResult::query()
            ->where('project_id', $project->id)
            ->where('feature', $feature->value)
            ->when($subType, fn ($q) => $q->where('sub_type', $subType))
            ->whereIn('status', [AiStatus::Pending->value, AiStatus::Processing->value])
            ->first();

        if ($inFlight) {
            return response()->json([
                'result_id' => $inFlight->id,
                'status'    => $inFlight->status->value,
                'message'   => 'Job already in progress.',
            ]);
        }

        // Create a result record
        $result = AiResult::create([
            'project_id'   => $project->id,
            'feature'      => $feature->value,
            'sub_type'     => $subType,
            'status'       => AiStatus::Pending->value,
            'requested_by' => $request->user()?->id,
        ]);

        // Dispatch the appropriate job
        match ($feature) {
            AiFeature::Summary => GenerateAiSummary::dispatch($result->id, $project->id, $subType),
            AiFeature::Similar => FindSimilarProjects::dispatch($result->id, $project->id),
            AiFeature::Judge   => RunAiJudge::dispatch($result->id, $project->id),
            AiFeature::Tags    => GenerateAiTags::dispatch($result->id, $project->id),
        };

        return response()->json([
            'result_id' => $result->id,
            'status'    => AiStatus::Pending->value,
            'message'   => 'Job dispatched successfully.',
        ], 202);
    }

    /**
     * Poll the status of an AI result.
     * GET /api/ai/results/{result}
     */
    public function status(AiResult $result): JsonResponse
    {
        return response()->json([
            'id'             => $result->id,
            'feature'        => $result->feature->value,
            'sub_type'       => $result->sub_type,
            'status'         => $result->status->value,
            'processing_ms'  => $result->processing_ms,
            'error_message'  => $result->error_message,
            'created_at'     => $result->created_at?->toISOString(),
            'completed_at'   => $result->completed_at?->toISOString(),
        ]);
    }

    /**
     * Get the full result payload once completed.
     * GET /api/ai/results/{result}/data
     */
    public function result(AiResult $result): JsonResponse
    {
        if (! $result->isCompleted()) {
            return response()->json([
                'status'  => $result->status->value,
                'message' => 'Result not ready yet.',
            ], 409);
        }

        return response()->json([
            'id'            => $result->id,
            'feature'       => $result->feature->value,
            'sub_type'      => $result->sub_type,
            'status'        => $result->status->value,
            'result'        => $result->result,
            'model'         => $result->model,
            'input_tokens'  => $result->input_tokens,
            'output_tokens' => $result->output_tokens,
            'processing_ms' => $result->processing_ms,
            'completed_at'  => $result->completed_at?->toISOString(),
        ]);
    }

    /**
     * List all AI results for a project (latest per feature/sub_type).
     * GET /api/ai/{project}/results
     */
    public function projectResults(Project $project): JsonResponse
    {
        $results = AiResult::where('project_id', $project->id)
            ->latest()
            ->get()
            ->map(fn (AiResult $r) => [
                'id'            => $r->id,
                'feature'       => $r->feature->value,
                'sub_type'      => $r->sub_type,
                'status'        => $r->status->value,
                'processing_ms' => $r->processing_ms,
                'error_message' => $r->isFailed() ? $r->error_message : null,
                'has_result'    => $r->isCompleted(),
                'completed_at'  => $r->completed_at?->toISOString(),
                'created_at'    => $r->created_at?->toISOString(),
            ]);

        return response()->json(['results' => $results]);
    }

    /**
     * Apply AI-generated tags to the project.
     * POST /api/ai/results/{result}/apply-tags
     */
    public function applyTags(Request $request, AiResult $result): JsonResponse
    {
        abort_unless($result->feature === AiFeature::Tags && $result->isCompleted(), 422, 'Invalid result.');

        $tags = $result->result['tags'] ?? [];

        $result->project->update(['tags' => $tags]);

        return response()->json(['message' => 'Tags applied successfully.', 'tags' => $tags]);
    }
}
