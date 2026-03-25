<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Presence channel for chat — allows member tracking and whispers
Broadcast::channel('chat', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});

// Private channels for whispers — one per user for receiving private messages
Broadcast::private('chat.whisper.{recipientId}', function ($user, $recipientId) {
    return (int) $user->id === (int) $recipientId;
});

// Private channel per conversation — any participant may subscribe
Broadcast::private('conversation.{conversationId}', function ($user, $conversationId) {
    return $user->conversations()
        ->where('conversations.id', (int) $conversationId)
        ->exists();
});

// Presence channel for the messaging lobby (online status tracking)
Broadcast::channel('messaging.lobby', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => null,
    ];
});
