<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class RejectProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('reject', $this->route('project'));
    }

    public function rules(): array
    {
        return [
            'rejection_notes' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }
}
