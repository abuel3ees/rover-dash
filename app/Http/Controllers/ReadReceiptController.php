<?php

namespace App\Http\Controllers;

use App\Events\ConversationRead;
use App\Models\Conversation;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReadReceiptController extends Controller
{
    public function store(Request $request, Conversation $conversation): JsonResponse
    {
        $user = auth()->user();

        // Gate: user must be participant
        abort_unless(
            $conversation->participants()->where('user_id', $user->id)->exists(),
            403
        );

        $lastMessage = $conversation->messages()
            ->orderByDesc('created_at')
            ->first();

        $conversation->participants()
            ->where('user_id', $user->id)
            ->update(['last_read_message_id' => $lastMessage?->id]);

        try {
            broadcast(new ConversationRead($conversation, $user->id, $lastMessage?->id))->toOthers();
        } catch (BroadcastException) {
            // Reverb not running
        }

        return response()->json(['ok' => true]);
    }
}
