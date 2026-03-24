<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBatchTelemetryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.type' => ['required', 'string', Rule::in(['gps', 'accelerometer', 'battery', 'temperature'])],
            'items.*.data' => ['required', 'array'],
            'items.*.recorded_at' => ['required', 'date'],
        ];
    }
}
