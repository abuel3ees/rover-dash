<?php

namespace App\Http\Controllers;

use App\Events\MessagePinned;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessagePinController extends Controller
{
    public function store(Request $request, Conversation $conversation, Message $message): RedirectResponse
    {
        // Gate: user must be participant
        abort_unless(
            $conversation->participants()->where('user_id', auth()->id())->exists(),
            403
        );

        abort_unless($message->conversation_id === $conversation->id, 404);

        // Toggle is_pinned
        $message->update([
            'is_pinned' => !$message->is_pinned,
        ]);

        try {
            broadcast(new MessagePinned($message, $conversation))->toOthers();
        } catch (BroadcastException) {
            // Reverb not running
        }

        return back();
    }
}
