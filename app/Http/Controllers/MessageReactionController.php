<?php

namespace App\Http\Controllers;

use App\Events\MessageReactionUpdated;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageReaction;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageReactionController extends Controller
{
    public function store(Request $request, Conversation $conversation, Message $message): RedirectResponse
    {
        // Gate: user must be participant
        abort_unless(
            $conversation->participants()->where('user_id', auth()->id())->exists(),
            403
        );

        abort_unless($message->conversation_id === $conversation->id, 404);

        $validated = $request->validate([
            'emoji' => 'required|in:👍,❤️,😂,😮,😢,👏',
        ]);

        $user = auth()->user();

        // Toggle: if reaction exists, delete it; else create it
        $existing = MessageReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->where('emoji', $validated['emoji'])
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            MessageReaction::create([
                'message_id' => $message->id,
                'user_id' => $user->id,
                'emoji' => $validated['emoji'],
            ]);
        }

        // Reload and broadcast
        $message->load('reactions.user');

        try {
            broadcast(new MessageReactionUpdated($message, $conversation))->toOthers();
        } catch (BroadcastException) {
            // Reverb not running
        }

        return back();
    }
}
