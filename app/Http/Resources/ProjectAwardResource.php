<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectAwardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        return [
            'id'               => $this->id,
            'title'            => $locale === 'ar' ? ($this->title_ar ?? $this->title) : $this->title,
            'title_ar'         => $this->title_ar,
            'title_en'         => $this->title,
            'description'      => $locale === 'ar' ? ($this->description_ar ?? $this->description) : $this->description,
            'awarding_body'    => $this->awarding_body,
            'rank'             => $this->rank,
            'awarded_at'       => $this->awarded_at?->toDateString(),
            'award_image'      => $this->award_image,
            'competition_id'   => $this->competition_id,
        ];
    }
}
