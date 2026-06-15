<?php

namespace App\DTOs;

use App\Enums\ProjectVisibility;

readonly class ProjectDTO
{
    public function __construct(
        public string  $title,
        public string  $title_ar,
        public ?string $subtitle = null,
        public ?string $subtitle_ar = null,
        public ?string $description = null,
        public ?string $description_ar = null,
        public ?string $abstract = null,
        public ?string $abstract_ar = null,
        public ?string $category_id = null,
        public ?string $academic_year = null,
        public ?string $academic_level = null,
        public ?string $department = null,
        public ?string $supervisor_name = null,
        public ?string $supervisor_name_ar = null,
        public ?string $supervisor_email = null,
        public ?string $demo_url = null,
        public ?string $repository_url = null,
        public ?string $documentation_url = null,
        public ?string $video_url = null,
        public ProjectVisibility $visibility = ProjectVisibility::Public,
        public bool    $is_featured = false,
        public bool    $allow_downloads = true,
        public ?array  $tags = null,
        public ?array  $meta = null,
        public ?array  $technology_ids = null,
        public ?array  $language_ids = null,
        public ?array  $competition_ids = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            title:              $data['title'],
            title_ar:           $data['title_ar'],
            subtitle:           $data['subtitle'] ?? null,
            subtitle_ar:        $data['subtitle_ar'] ?? null,
            description:        $data['description'] ?? null,
            description_ar:     $data['description_ar'] ?? null,
            abstract:           $data['abstract'] ?? null,
            abstract_ar:        $data['abstract_ar'] ?? null,
            category_id:        $data['category_id'] ?? null,
            academic_year:      $data['academic_year'] ?? null,
            academic_level:     $data['academic_level'] ?? null,
            department:         $data['department'] ?? null,
            supervisor_name:    $data['supervisor_name'] ?? null,
            supervisor_name_ar: $data['supervisor_name_ar'] ?? null,
            supervisor_email:   $data['supervisor_email'] ?? null,
            demo_url:           $data['demo_url'] ?? null,
            repository_url:     $data['repository_url'] ?? null,
            documentation_url:  $data['documentation_url'] ?? null,
            video_url:          $data['video_url'] ?? null,
            visibility:         isset($data['visibility']) ? ProjectVisibility::from($data['visibility']) : ProjectVisibility::Public,
            is_featured:        (bool) ($data['is_featured'] ?? false),
            allow_downloads:    (bool) ($data['allow_downloads'] ?? true),
            tags:               $data['tags'] ?? null,
            meta:               $data['meta'] ?? null,
            technology_ids:     $data['technology_ids'] ?? null,
            language_ids:       $data['language_ids'] ?? null,
            competition_ids:    $data['competition_ids'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'title'              => $this->title,
            'title_ar'           => $this->title_ar,
            'subtitle'           => $this->subtitle,
            'subtitle_ar'        => $this->subtitle_ar,
            'description'        => $this->description,
            'description_ar'     => $this->description_ar,
            'abstract'           => $this->abstract,
            'abstract_ar'        => $this->abstract_ar,
            'category_id'        => $this->category_id,
            'academic_year'      => $this->academic_year,
            'academic_level'     => $this->academic_level,
            'department'         => $this->department,
            'supervisor_name'    => $this->supervisor_name,
            'supervisor_name_ar' => $this->supervisor_name_ar,
            'supervisor_email'   => $this->supervisor_email,
            'demo_url'           => $this->demo_url,
            'repository_url'     => $this->repository_url,
            'documentation_url'  => $this->documentation_url,
            'video_url'          => $this->video_url,
            'visibility'         => $this->visibility->value,
            'is_featured'        => $this->is_featured,
            'allow_downloads'    => $this->allow_downloads,
            'tags'               => $this->tags,
            'meta'               => $this->meta,
        ];
    }
}
