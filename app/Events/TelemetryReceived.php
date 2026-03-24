<?php

namespace App\Events;

use App\Models\TelemetryData;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TelemetryReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TelemetryData $telemetry,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('rover.'.$this->telemetry->rover_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->telemetry->id,
            'type' => $this->telemetry->type,
            'data' => $this->telemetry->data,
            'recorded_at' => $this->telemetry->recorded_at->toISOString(),
        ];
    }
}
