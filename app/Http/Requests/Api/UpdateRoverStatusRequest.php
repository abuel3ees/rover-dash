<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoverStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::in(['online', 'offline', 'error', 'maintenance'])],
            'ip_address' => ['sometimes', 'nullable', 'ip'],
            'stream_url' => ['sometimes', 'nullable', 'url'],
            'stream_port' => ['sometimes', 'nullable', 'integer', 'between:1,65535'],
            'hardware_info' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
