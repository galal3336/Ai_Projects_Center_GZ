<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        return [
            'id'                 => $this->id,
            'slug'               => $this->slug,

            // Bilingual title/description resolved to current locale
            'title'              => $locale === 'ar' ? ($this->title_ar ?? $this->title) : $this->title,
            'title_ar'           => $this->title_ar,
            'title_en'           => $this->title,
            'description'        => $locale === 'ar' ? ($this->description_ar ?? $this->description) : $this->description,
            'abstract'           => $locale === 'ar' ? ($this->abstract_ar ?? $this->abstract) : $this->abstract,

            // Status & visibility
            'status'             => $this->status->value,
            'status_label'       => $this->status->label(),
            'status_color'       => $this->status->color(),
            'visibility'         => $this->visibility->value,

            // Academic context
            'department'         => $this->department,
            'academic_year'      => $this->academic_year,
            'academic_level'     => $this->academic_level,
            'supervisor_name'    => $locale === 'ar' ? ($this->supervisor_name_ar ?? $this->supervisor_name) : $this->supervisor_name,

            // URLs
            'demo_url'           => $this->demo_url,
            'repository_url'     => $this->repository_url,
            'documentation_url'  => $this->documentation_url,
            'video_url'          => $this->video_url,

            // Metrics
            'views_count'        => $this->views_count,
            'downloads_count'    => $this->downloads_count,
            'likes_count'        => $this->likes_count,
            'stars_count'        => $this->stars_count,
            'bookmarks_count'    => $this->bookmarks_count,
            'followers_count'    => $this->followers_count,
            'trending_score'     => $this->trending_score,

            // Flags
            'is_featured'        => $this->is_featured,
            'allow_downloads'    => $this->allow_downloads,

            // Tags
            'tags'               => $this->tags ?? [],

            // Thumbnail
            'thumbnail'          => $this->thumbnail,

            // Dates
            'published_at'       => $this->published_at?->toIso8601String(),
            'submitted_at'       => $this->submitted_at?->toIso8601String(),
            'created_at'         => $this->created_at->toIso8601String(),
            'updated_at'         => $this->updated_at->toIso8601String(),

            // Rejection notes — only visible to owner/admin
            'rejection_notes'    => $this->when(
                // Use pre-computed flag when available (collection context), fall back to Gate for single resource
                ($this->additional['can_review'] ?? null) !== null
                    ? ($this->additional['can_review'] || $request->user()?->id === $this->owner_id)
                    : $request->user()?->can('viewRejectionNotes', $this->resource),
                $this->rejection_notes,
            ),

            // Relations (conditionally loaded)
            'owner'              => $this->whenLoaded('owner', fn () => [
                'id'     => $this->owner->id,
                'name'   => $this->owner->name,
                'avatar' => $this->owner->avatar,
            ]),

            'category'           => new CategoryResource($this->whenLoaded('category')),
            'technologies'       => TechnologyResource::collection($this->whenLoaded('technologies')),
            'languages'          => $this->whenLoaded('languages', fn () => $this->languages->map(fn ($l) => [
                'id'   => $l->id,
                'name' => $locale === 'ar' ? ($l->name_ar ?? $l->name) : $l->name,
                'code' => $l->code,
                'flag' => $l->flag,
            ])),
            'members'            => ProjectMemberResource::collection($this->whenLoaded('members')),
            'awards'             => ProjectAwardResource::collection($this->whenLoaded('awards')),
            'links'              => ProjectLinkResource::collection($this->whenLoaded('links')),
            'images'             => $this->whenLoaded('images', fn () => $this->images->map(fn ($img) => [
                'id'      => $img->id,
                'url'     => $img->url,
                'caption' => $locale === 'ar' ? ($img->caption_ar ?? $img->caption) : $img->caption,
                'sort'    => $img->sort_order,
            ])),
            'latest_version'     => $this->whenLoaded('latestVersion', fn () => [
                'id'           => $this->latestVersion?->id,
                'version'      => $this->latestVersion?->version,
                'release_notes'=> $this->latestVersion?->release_notes,
                'released_at'  => $this->latestVersion?->released_at?->toDateString(),
            ]),

            // SEO fields
            'seo_title'       => $this->seo_title,
            'seo_description' => $this->seo_description,
            'seo_keywords'    => $this->seo_keywords ?? [],
            'canonical_url'   => route('projects.show', [
                'locale' => app()->getLocale(),
                'slug'   => $this->slug,
            ]),

            // Admin-only context
            'reviewer'           => $this->when(
                $this->additional['can_review'] ?? $request->user()?->can('review', \App\Models\Project::class),
                fn () => $this->whenLoaded('reviewer', fn () => [
                    'id'   => $this->reviewer->id,
                    'name' => $this->reviewer->name,
                ]),
            ),
            'reviewed_at'        => $this->when(
                $this->additional['can_review'] ?? $request->user()?->can('review', \App\Models\Project::class),
                $this->reviewed_at?->toIso8601String(),
            ),
        ];
    }
}
