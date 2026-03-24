<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ChatMessageSent implements ShouldBroadcastNow
{
    public function __construct(
        private User $user,
        private string $body,
    ) {}

    public function broadcastOn(): PresenceChannel
    {
        return new PresenceChannel('chat');
    }

    public function broadcastWith(): array
    {
        return [
            'id' => uniqid(),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'body' => $this->body,
            'created_at' => now()->toISOString(),
        ];
    }
}
