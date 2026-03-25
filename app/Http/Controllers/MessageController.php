<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Events\MessageDeleted;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request, Conversation $conversation): RedirectResponse
    {
        // Gate: user must be participant
        abort_unless(
            $conversation->participants()->where('user_id', auth()->id())->exists(),
            403
        );

        $validated = $request->validate([
            'body' => 'required|string|max:4000',
            'reply_to_id' => 'nullable|integer|exists:messages,id',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => auth()->id(),
            'reply_to_id' => $validated['reply_to_id'] ?? null,
            'body' => $validated['body'],
        ]);

        $message->load('user:id,name');

        // Broadcast the message (except for broadcast type which remains ephemeral)
        if ($conversation->type !== 'broadcast') {
            try {
                broadcast(new MessageSent($message, $conversation))->toOthers();
            } catch (BroadcastException) {
                // Reverb not running
            }
        }

        return back();
    }

    public function update(Request $request, Conversation $conversation, Message $message): RedirectResponse
    {
        // Gate: user must be creator of message
        abort_unless($message->user_id === auth()->id(), 403);
        abort_unless($message->conversation_id === $conversation->id, 404);

        $validated = $request->validate([
            'body' => 'required|string|max:4000',
        ]);

        $message->update([
            'body' => $validated['body'],
            'edited_at' => now(),
        ]);

        try {
            broadcast(new MessageUpdated($message, $conversation))->toOthers();
        } catch (BroadcastException) {
            // Reverb not running
        }

        return back();
    }

    public function destroy(Request $request, Conversation $conversation, Message $message): RedirectResponse
    {
        // Gate: user must be creator of message
        abort_unless($message->user_id === auth()->id(), 403);
        abort_unless($message->conversation_id === $conversation->id, 404);

        $message->update([
            'body' => '',
            'deleted_at' => now(),
        ]);

        try {
            broadcast(new MessageDeleted($message, $conversation))->toOthers();
        } catch (BroadcastException) {
            // Reverb not running
        }

        return back();
    }
}
