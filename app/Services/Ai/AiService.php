<?php

namespace App\Services\Ai;

use App\Models\Project;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class AiService
{
    private const API_URL   = 'https://api.anthropic.com/v1/messages';
    private const MODEL     = 'claude-sonnet-4-6';
    private const API_VER   = '2023-06-01';
    private const MAX_TOKENS = 4096;

    private PendingRequest $http;

    public function __construct()
    {
        $this->http = Http::withHeaders([
            'x-api-key'         => config('services.anthropic.key'),
            'anthropic-version' => self::API_VER,
            'content-type'      => 'application/json',
        ])->timeout(180);
    }

    // ─── Public feature methods ───────────────────────────────────────────────

    /**
     * Generate executive / technical / business summary for a project.
     * $type: 'executive' | 'technical' | 'business'
     */
    public function generateSummary(Project $project, string $type): array
    {
        $context = $this->buildProjectContext($project);
        $prompt  = $this->summaryPrompt($context, $type);

        $response = $this->call($prompt, maxTokens: 2048);

        return $this->parseSummaryResponse($response, $type);
    }

    /**
     * Find semantically similar projects from the given candidate pool.
     */
    public function findSimilarProjects(Project $project, array $candidates): array
    {
        $context = $this->buildProjectContext($project);
        $pool    = $this->buildCandidateContext($candidates);
        $prompt  = $this->similarPrompt($context, $pool);

        $response = $this->call($prompt, maxTokens: 1024);

        return $this->parseSimilarResponse($response);
    }

    /**
     * Run AI judge evaluation across 4 dimensions.
     */
    public function runJudge(Project $project): array
    {
        $context = $this->buildProjectContext($project);
        $prompt  = $this->judgePrompt($context);

        $response = $this->call($prompt, maxTokens: self::MAX_TOKENS);

        return $this->parseJudgeResponse($response);
    }

    /**
     * Generate a curated tag set for the project.
     */
    public function generateTags(Project $project): array
    {
        $context = $this->buildProjectContext($project);
        $prompt  = $this->tagsPrompt($context);

        $response = $this->call($prompt, maxTokens: 512);

        return $this->parseTagsResponse($response);
    }

    // ─── API call ─────────────────────────────────────────────────────────────

    /** Returns ['content' => string, 'model' => string, 'input_tokens' => int, 'output_tokens' => int] */
    public function call(string $prompt, int $maxTokens = self::MAX_TOKENS): array
    {
        $response = $this->http->post(self::API_URL, [
            'model'      => self::MODEL,
            'max_tokens' => $maxTokens,
            'messages'   => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                'Claude API error ' . $response->status() . ': ' . $response->body()
            );
        }

        $body = $response->json();

        return [
            'content'       => $body['content'][0]['text'] ?? '',
            'model'         => $body['model'] ?? self::MODEL,
            'input_tokens'  => $body['usage']['input_tokens'] ?? 0,
            'output_tokens' => $body['usage']['output_tokens'] ?? 0,
        ];
    }

    // ─── Context builders ─────────────────────────────────────────────────────

    private function buildProjectContext(Project $project): string
    {
        $tech    = $project->technologies->pluck('name')->implode(', ');
        $cats    = $project->category?->name ?? 'N/A';
        $awards  = $project->awards->pluck('title')->implode('; ');
        $members = $project->members->count();
        $tags    = is_array($project->tags) ? implode(', ', $project->tags) : '';
        $links   = $project->links->map(fn($l) => "{$l->type}: {$l->url}")->implode(' | ');

        return <<<TEXT
        PROJECT CONTEXT
        ===============
        Title: {$project->title}
        Category: {$cats}
        Status: {$project->status->label()}
        Academic Year: {$project->academic_year}
        Academic Level: {$project->academic_level}
        Department: {$project->department}
        Team Size: {$members}

        Abstract:
        {$project->abstract}

        Description:
        {$project->description}

        Technologies: {$tech}
        Tags: {$tags}
        External Links: {$links}
        Awards: {$awards}
        Views: {$project->views_count} | Downloads: {$project->downloads_count} | Likes: {$project->likes_count}
        Average Rating: {$project->average_rating}/5 ({$project->ratings_count} ratings)
        TEXT;
    }

    private function buildCandidateContext(array $candidates): string
    {
        return collect($candidates)->map(function ($c, $i) {
            $tech = implode(', ', $c['technologies'] ?? []);
            return "#{$i}: ID={$c['id']} Title=\"{$c['title']}\" Category={$c['category']} Tech={$tech} Abstract={$c['abstract']}";
        })->implode("\n");
    }

    // ─── Prompts ──────────────────────────────────────────────────────────────

    private function summaryPrompt(string $context, string $type): string
    {
        $instructions = match($type) {
            'executive' => <<<INST
            Write an EXECUTIVE SUMMARY (150-200 words) suitable for sponsors, judges, and university administrators.
            Focus on: problem statement, solution value proposition, impact metrics, and key achievements.
            Tone: professional, concise, persuasive.
            INST,

            'technical' => <<<INST
            Write a TECHNICAL SUMMARY (200-250 words) for software engineers and technical reviewers.
            Focus on: architecture decisions, technology stack rationale, key algorithms/models used,
            scalability approach, and notable engineering challenges solved.
            Tone: precise, technical, structured.
            INST,

            'business' => <<<INST
            Write a BUSINESS SUMMARY (150-200 words) for investors, industry partners, and entrepreneurs.
            Focus on: market problem, target users, competitive advantage, monetization potential,
            and go-to-market opportunity.
            Tone: compelling, outcome-focused, business-minded.
            INST,

            default => 'Write a general project summary.',
        };

        return <<<PROMPT
        You are an expert academic project evaluator. Given the following project details, {$instructions}

        {$context}

        Respond ONLY with a JSON object in exactly this format — no markdown, no extra text:
        {
            "summary": "<the summary text>",
            "key_points": ["<point 1>", "<point 2>", "<point 3>", "<point 4>", "<point 5>"],
            "one_liner": "<A single compelling sentence under 20 words>"
        }
        PROMPT;
    }

    private function similarPrompt(string $context, string $pool): string
    {
        return <<<PROMPT
        You are an expert at matching academic AI projects based on topic, technology, and methodology similarity.

        TARGET PROJECT:
        {$context}

        CANDIDATE PROJECTS:
        {$pool}

        Analyze semantic similarity considering: domain overlap, shared technologies, comparable problem scope, and methodology alignment.

        Respond ONLY with a JSON object — no markdown, no extra text:
        {
            "matches": [
                {
                    "id": "<candidate id>",
                    "score": <0-100 integer similarity score>,
                    "reason": "<One sentence explaining the similarity>",
                    "shared_aspects": ["<aspect 1>", "<aspect 2>"]
                }
            ],
            "analysis": "<2-3 sentence overall analysis of the similarity landscape>"
        }

        Order matches by score descending. Include up to 5 matches with score >= 40.
        PROMPT;
    }

    private function judgePrompt(string $context): string
    {
        return <<<PROMPT
        You are an expert AI competition judge with deep knowledge in software engineering, AI/ML, product design, and academic research.

        Evaluate the following project across 4 dimensions. Be critical, fair, and specific.

        {$context}

        Score each dimension from 0-100 and provide detailed feedback.

        Respond ONLY with a JSON object — no markdown, no extra text:
        {
            "overall_score": <weighted average 0-100>,
            "verdict": "<Approved | Conditionally Approved | Needs Improvement | Rejected>",
            "dimensions": {
                "documentation": {
                    "score": <0-100>,
                    "grade": "<A | B | C | D | F>",
                    "summary": "<2-3 sentence evaluation>",
                    "strengths": ["<strength 1>", "<strength 2>"],
                    "weaknesses": ["<weakness 1>", "<weakness 2>"],
                    "recommendations": ["<rec 1>", "<rec 2>"]
                },
                "architecture": {
                    "score": <0-100>,
                    "grade": "<A | B | C | D | F>",
                    "summary": "<2-3 sentence evaluation>",
                    "strengths": ["<strength 1>", "<strength 2>"],
                    "weaknesses": ["<weakness 1>", "<weakness 2>"],
                    "recommendations": ["<rec 1>", "<rec 2>"]
                },
                "innovation": {
                    "score": <0-100>,
                    "grade": "<A | B | C | D | F>",
                    "summary": "<2-3 sentence evaluation>",
                    "strengths": ["<strength 1>", "<strength 2>"],
                    "weaknesses": ["<weakness 1>", "<weakness 2>"],
                    "recommendations": ["<rec 1>", "<rec 2>"]
                },
                "scalability": {
                    "score": <0-100>,
                    "grade": "<A | B | C | D | F>",
                    "summary": "<2-3 sentence evaluation>",
                    "strengths": ["<strength 1>", "<strength 2>"],
                    "weaknesses": ["<weakness 1>", "<weakness 2>"],
                    "recommendations": ["<rec 1>", "<rec 2>"]
                }
            },
            "executive_feedback": "<3-4 sentence overall assessment for the project team>",
            "highlights": ["<top achievement 1>", "<top achievement 2>", "<top achievement 3>"],
            "critical_improvements": ["<must-fix 1>", "<must-fix 2>"]
        }
        PROMPT;
    }

    private function tagsPrompt(string $context): string
    {
        return <<<PROMPT
        You are an expert technical taxonomist for an AI project showcase platform.

        Analyze the following project and generate a comprehensive, accurate tag set.

        {$context}

        Generate tags across these categories:
        - Technology tags (frameworks, languages, tools)
        - Domain tags (field of application, problem domain)
        - Methodology tags (ML techniques, approaches)
        - Feature tags (key capabilities)
        - Audience tags (who benefits)

        Rules:
        - Generate 8-15 tags total
        - Each tag: 1-3 words, Title Case
        - No duplicate concepts
        - Prioritize specificity over generality
        - Include existing tags only if accurate, replace inaccurate ones

        Respond ONLY with a JSON object — no markdown, no extra text:
        {
            "tags": ["<tag 1>", "<tag 2>", "..."],
            "categories": {
                "technology": ["<tag>"],
                "domain": ["<tag>"],
                "methodology": ["<tag>"],
                "feature": ["<tag>"],
                "audience": ["<tag>"]
            },
            "confidence": <0-100>,
            "rationale": "<One sentence explaining your tagging strategy>"
        }
        PROMPT;
    }

    // ─── Response parsers ─────────────────────────────────────────────────────

    private function parseSummaryResponse(array $response, string $type): array
    {
        $data = $this->decodeJson($response['content']);
        return [
            'type'        => $type,
            'summary'     => $data['summary'] ?? '',
            'key_points'  => $data['key_points'] ?? [],
            'one_liner'   => $data['one_liner'] ?? '',
            'model'       => $response['model'],
            'input_tokens'  => $response['input_tokens'],
            'output_tokens' => $response['output_tokens'],
        ];
    }

    private function parseSimilarResponse(array $response): array
    {
        $data = $this->decodeJson($response['content']);
        return [
            'matches'  => $data['matches'] ?? [],
            'analysis' => $data['analysis'] ?? '',
            'model'    => $response['model'],
            'input_tokens'  => $response['input_tokens'],
            'output_tokens' => $response['output_tokens'],
        ];
    }

    private function parseJudgeResponse(array $response): array
    {
        $data = $this->decodeJson($response['content']);
        return array_merge($data, [
            'model'         => $response['model'],
            'input_tokens'  => $response['input_tokens'],
            'output_tokens' => $response['output_tokens'],
        ]);
    }

    private function parseTagsResponse(array $response): array
    {
        $data = $this->decodeJson($response['content']);
        return [
            'tags'       => $data['tags'] ?? [],
            'categories' => $data['categories'] ?? [],
            'confidence' => $data['confidence'] ?? 0,
            'rationale'  => $data['rationale'] ?? '',
            'model'      => $response['model'],
            'input_tokens'  => $response['input_tokens'],
            'output_tokens' => $response['output_tokens'],
        ];
    }

    private function decodeJson(string $text): array
    {
        // Strip markdown code fences if Claude wraps in ```json
        $clean = preg_replace('/^```(?:json)?\s*/m', '', $text);
        $clean = preg_replace('/\s*```$/m', '', $clean);
        $clean = trim($clean);

        $decoded = json_decode($clean, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException('Failed to parse Claude JSON response: ' . json_last_error_msg() . "\n\nRaw: {$text}");
        }

        return $decoded;
    }
}
