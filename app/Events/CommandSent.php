<?php

namespace App\Events;

use App\Models\Command;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommandSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Command $command,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('rover.'.$this->command->rover_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->command->id,
            'type' => $this->command->type,
            'payload' => $this->command->payload,
            'status' => $this->command->status,
            'created_at' => $this->command->created_at->toISOString(),
        ];
    }
}
