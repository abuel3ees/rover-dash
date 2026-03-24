<?php

namespace App\Events;

use App\Models\Command;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommandCompleted implements ShouldBroadcast
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
            'status' => $this->command->status,
            'executed_at' => $this->command->executed_at?->toISOString(),
            'response' => $this->command->response,
        ];
    }
}
