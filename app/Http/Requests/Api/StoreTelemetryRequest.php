<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTelemetryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(['gps', 'accelerometer', 'battery', 'temperature'])],
            'data' => ['required', 'array'],
            'recorded_at' => ['required', 'date'],
        ];
    }
}
