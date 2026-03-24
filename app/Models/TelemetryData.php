<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['rover_id', 'type', 'data', 'recorded_at'])]
class TelemetryData extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'recorded_at' => 'datetime',
        ];
    }

    public function rover(): BelongsTo
    {
        return $this->belongsTo(Rover::class);
    }
}
