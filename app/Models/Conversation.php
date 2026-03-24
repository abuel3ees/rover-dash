<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['type', 'name', 'created_by'])]
class Conversation extends Model
{
    use HasFactory;

    protected $casts = [
        'type' => 'string',
    ];

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['last_read_message_id', 'joined_at'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function pinnedMessages(): HasMany
    {
        return $this->hasMany(Message::class)
            ->where('is_pinned', true)
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }

    public function scopeDm($query)
    {
        return $query->where('type', 'dm');
    }

    public function scopeGroup($query)
    {
        return $query->where('type', 'group');
    }

    public function getDmPartner(User $me): ?User
    {
        if ($this->type !== 'dm') {
            return null;
        }

        return $this->participants()
            ->where('user_id', '!=', $me->id)
            ->first();
    }

    public function getUnreadCount(int $userId): int
    {
        $participant = $this->participants()
            ->where('user_id', $userId)
            ->first();

        if (!$participant) {
            return 0;
        }

        $lastReadId = $participant->pivot->last_read_message_id;

        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->when($lastReadId, function ($query) use ($lastReadId) {
                $query->where('id', '>', $lastReadId);
            })
            ->whereNull('deleted_at')
            ->count();
    }
}
