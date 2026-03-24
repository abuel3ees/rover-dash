<?php

namespace App\Events;

use App\Models\Rover;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoverStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Rover $rover,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('rover.'.$this->rover->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->rover->id,
            'status' => $this->rover->status,
            'is_online' => $this->rover->isOnline(),
            'last_seen_at' => $this->rover->last_seen_at?->toISOString(),
        ];
    }
}
