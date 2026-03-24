<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'stream_url' => ['nullable', 'url'],
            'ip_address' => ['nullable', 'ip'],
            'stream_port' => ['nullable', 'integer', 'between:1,65535'],
        ];
    }
}
