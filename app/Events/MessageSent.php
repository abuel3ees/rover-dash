<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        private Message $message,
        private Conversation $conversation,
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('conversation.' . $this->conversation->id);
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
                'avatar' => $this->message->user->avatar,
            ],
            'body' => $this->message->body,
            'reply_to_id' => $this->message->reply_to_id,
            'is_pinned' => $this->message->is_pinned,
            'edited_at' => $this->message->edited_at?->toIso8601String(),
            'deleted_at' => $this->message->deleted_at?->toIso8601String(),
            'created_at' => $this->message->created_at->toIso8601String(),
            'reactions' => [],
        ];
    }
}
