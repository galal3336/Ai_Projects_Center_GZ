<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('project'));
    }

    public function rules(): array
    {
        return [
            'title'              => ['sometimes', 'required', 'string', 'max:255'],
            'title_ar'           => ['sometimes', 'required', 'string', 'max:255'],
            'subtitle'           => ['nullable', 'string', 'max:255'],
            'subtitle_ar'        => ['nullable', 'string', 'max:255'],
            'description'        => ['nullable', 'string', 'max:10000'],
            'description_ar'     => ['nullable', 'string', 'max:10000'],
            'abstract'           => ['nullable', 'string', 'max:3000'],
            'abstract_ar'        => ['nullable', 'string', 'max:3000'],
            'category_id'        => ['nullable', 'uuid', 'exists:categories,id'],
            'academic_year'      => ['nullable', 'string', 'max:10'],
            'academic_level'     => ['nullable', 'string', 'max:100'],
            'department'         => ['nullable', 'string', 'max:150'],
            'supervisor_name'    => ['nullable', 'string', 'max:150'],
            'supervisor_name_ar' => ['nullable', 'string', 'max:150'],
            'supervisor_email'   => ['nullable', 'email'],
            'demo_url'           => ['nullable', 'url', 'max:500'],
            'repository_url'     => ['nullable', 'url', 'max:500'],
            'documentation_url'  => ['nullable', 'url', 'max:500'],
            'video_url'          => ['nullable', 'url', 'max:500'],
            'visibility'         => ['nullable', Rule::in(['public', 'university', 'private'])],
            'allow_downloads'    => ['nullable', 'boolean'],
            'tags'               => ['nullable', 'array', 'max:10'],
            'tags.*'             => ['string', 'max:50'],
            'technology_ids'     => ['nullable', 'array'],
            'technology_ids.*'   => ['uuid', 'exists:technologies,id'],
            'language_ids'       => ['nullable', 'array'],
            'language_ids.*'     => ['uuid', 'exists:languages,id'],
            'competition_ids'    => ['nullable', 'array'],
            'competition_ids.*'  => ['uuid', 'exists:competitions,id'],
        ];
    }
}
