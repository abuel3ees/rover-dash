<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['rover_id', 'user_id', 'type', 'payload', 'status', 'sent_at', 'executed_at', 'response'])]
class Command extends Model
{
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'sent_at' => 'datetime',
            'executed_at' => 'datetime',
        ];
    }

    public function rover(): BelongsTo
    {
        return $this->belongsTo(Rover::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
