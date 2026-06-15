<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'name'         => $locale === 'ar' ? ($this->name_ar ?? $this->name) : $this->name,
            'name_ar'      => $this->name_ar,
            'name_en'      => $this->name,
            'role'         => $this->role,
            'contribution' => $this->contribution,
            'is_leader'    => $this->is_leader,
            'avatar'       => $this->avatar,
            'user'         => $this->when($this->relationLoaded('user'), fn () => [
                'id'     => $this->user->id,
                'name'   => $this->user->name,
                'email'  => $this->user->email,
                'avatar' => $this->user->avatar,
            ]),
        ];
    }
}
