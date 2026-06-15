<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        return [
            'id'              => $this->id,
            'name'            => $locale === 'ar' ? ($this->name_ar ?? $this->name) : $this->name,
            'name_ar'         => $this->name_ar,
            'name_en'         => $this->name,
            'slug'            => $this->slug,
            'description'     => $locale === 'ar' ? ($this->description_ar ?? $this->description) : $this->description,
            'icon'            => $this->icon,
            'color'           => $this->color,
            'parent_id'       => $this->parent_id,
            'projects_count'  => $this->when(isset($this->projects_count), $this->projects_count),
            'children'        => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
