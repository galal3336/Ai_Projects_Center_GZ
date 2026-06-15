<?php

namespace App\DTOs;

readonly class ProjectFilterDTO
{
    public function __construct(
        // Full-text query (searches title, abstract, description)
        public ?string $search = null,

        // Targeted field searches
        public ?string $student_name = null,    // search project_members.name
        public ?string $supervisor = null,       // search projects.supervisor_name
        public ?string $technology_id = null,    // filter by technology UUID
        public ?string $technology_name = null,  // fulltext search technologies.name
        public ?string $competition_id = null,   // filter by competition UUID
        public ?string $competition_name = null, // fulltext search competitions.name
        public ?string $category_id = null,      // filter by category UUID
        public ?string $category_name = null,    // fulltext search categories.name
        public ?string $award_name = null,       // fulltext search project_awards.title
        public ?string $award_rank = null,       // filter by award rank (first, second, third)

        // Standard filters
        public ?string $status = null,
        public ?string $visibility = null,
        public ?string $academic_year = null,
        public ?string $department = null,
        public ?string $owner_id = null,

        // Smart filters
        public bool $winning_only = false,      // has at least one award
        public bool $featured_only = false,

        // Sort
        public ?string $sort = 'published_at',
        public string  $direction = 'desc',
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            search:           $data['search'] ?? null,
            student_name:     $data['student_name'] ?? null,
            supervisor:       $data['supervisor'] ?? null,
            technology_id:    $data['technology_id'] ?? null,
            technology_name:  $data['technology_name'] ?? null,
            competition_id:   $data['competition_id'] ?? null,
            competition_name: $data['competition_name'] ?? null,
            category_id:      $data['category_id'] ?? null,
            category_name:    $data['category_name'] ?? null,
            award_name:       $data['award_name'] ?? null,
            award_rank:       $data['award_rank'] ?? null,
            status:           $data['status'] ?? null,
            visibility:       $data['visibility'] ?? null,
            academic_year:    $data['academic_year'] ?? null,
            department:       $data['department'] ?? null,
            owner_id:         $data['owner_id'] ?? null,
            winning_only:     (bool) ($data['winning_only'] ?? false),
            featured_only:    (bool) ($data['featured_only'] ?? false),
            sort:             $data['sort'] ?? 'published_at',
            direction:        $data['direction'] ?? 'desc',
        );
    }

    public function hasActiveFilters(): bool
    {
        return (bool) (
            $this->search || $this->student_name || $this->supervisor ||
            $this->technology_id || $this->technology_name ||
            $this->competition_id || $this->competition_name ||
            $this->category_id || $this->category_name ||
            $this->award_name || $this->award_rank ||
            $this->academic_year || $this->department ||
            $this->winning_only || $this->featured_only
        );
    }

    public function cacheKey(): string
    {
        return 'search:' . md5(serialize($this));
    }
}
