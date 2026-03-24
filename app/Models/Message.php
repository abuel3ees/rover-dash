<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['conversation_id', 'user_id', 'reply_to_id', 'body', 'is_pinned', 'edited_at', 'deleted_at'])]
class Message extends Model
{
    use HasFactory;

    protected $casts = [
        'edited_at' => 'datetime',
        'deleted_at' => 'datetime',
        'is_pinned' => 'boolean',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class);
    }

    public function isDeleted(): bool
    {
        return $this->deleted_at !== null;
    }

    public function reactionsGrouped(): array
    {
        $authUserId = auth()->id();
        $reactions = [];
        $emojiMap = [];

        foreach ($this->reactions as $reaction) {
            $emoji = $reaction->emoji;
            if (!isset($emojiMap[$emoji])) {
                $emojiMap[$emoji] = [
                    'emoji' => $emoji,
                    'count' => 0,
                    'reacted' => false,
                ];
            }
            $emojiMap[$emoji]['count']++;
            if ($reaction->user_id === $authUserId) {
                $emojiMap[$emoji]['reacted'] = true;
            }
        }

        return array_values($emojiMap);
    }
}
