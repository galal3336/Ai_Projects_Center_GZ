<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreditsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        return [
            'id'                => $this->id,
            'user_id'           => $this->user_id,
            'name'              => $locale === 'ar' ? ($this->name_ar ?? $this->name) : $this->name,
            'name_en'           => $this->name,
            'name_ar'           => $this->name_ar,
            'title'             => $locale === 'ar' ? ($this->title_ar ?? $this->title) : $this->title,
            'title_en'          => $this->title,
            'title_ar'          => $this->title_ar,
            'bio'               => $locale === 'ar' ? ($this->bio_ar ?? $this->bio) : $this->bio,
            'bio_en'            => $this->bio,
            'bio_ar'            => $this->bio_ar,
            'avatar'            => $this->avatar,
            'email'             => $this->email,
            'linkedin_url'      => $this->linkedin_url,
            'github_url'        => $this->github_url,
            'website_url'       => $this->website_url,
            'type'              => $this->type,
            'category'          => $this->category,
            'contribution_year' => $this->contribution_year,
            'is_active'         => $this->is_active,
            'is_featured'       => $this->is_featured,
            'sort_order'        => $this->sort_order,
            'created_at'        => $this->created_at?->toIso8601String(),
            'updated_at'        => $this->updated_at?->toIso8601String(),
        ];
    }
}
