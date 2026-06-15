<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class RequestRevisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('requestRevision', $this->route('project'));
    }

    public function rules(): array
    {
        return [
            'revision_notes' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }
}
