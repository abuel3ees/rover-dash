<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhisperSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        private User $sender,
        private int $recipientId,
        private string $body,
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('chat.whisper.' . $this->recipientId);
    }

    public function broadcastWith(): array
    {
        return [
            'id' => uniqid(),
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
            ],
            'recipient_id' => $this->recipientId,
            'body' => $this->body,
            'created_at' => now()->toISOString(),
        ];
    }
}
