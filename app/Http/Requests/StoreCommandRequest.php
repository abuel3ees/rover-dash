<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in([
                'manual_override',
                'auto_follow',
                'move',
                'rotate',
                'stop',
                'speed',
                'camera',
                'custom',
                'ping',
            ])],
            'payload' => ['required', 'array'],
        ];
    }
}
