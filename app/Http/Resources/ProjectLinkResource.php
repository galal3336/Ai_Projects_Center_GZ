<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectLinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'    => $this->id,
            'type'  => $this->type,
            'label' => $this->label,
            'url'   => $this->url,
            'icon'  => $this->icon,
        ];
    }
}
