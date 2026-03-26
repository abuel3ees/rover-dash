<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'description', 'status', 'stream_url', 'ip_address', 'stream_port', 'hardware_info', 'last_seen_at'])]
class Rover extends Model
{
    use HasApiTokens, HasFactory;

    protected function casts(): array
    {
        return [
            'hardware_info' => 'array',
            'last_seen_at' => 'datetime',
            'stream_port' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function telemetryData(): HasMany
    {
        return $this->hasMany(TelemetryData::class);
    }

    public function commands(): HasMany
    {
        return $this->hasMany(Command::class);
    }

    public function latestTelemetry(string $type): ?TelemetryData
    {
        return $this->telemetryData()
            ->where('type', $type)
            ->latest('recorded_at')
            ->first();
    }

    public function pendingCommands(): HasMany
    {
        return $this->commands()->where('status', 'pending');
    }

    public function isOnline(): bool
    {
        return $this->last_seen_at
            && $this->last_seen_at->isAfter(now()->subSeconds(30));
    }
}
