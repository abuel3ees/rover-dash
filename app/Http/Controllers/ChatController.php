<?php

namespace App\Http\Controllers;

use App\Events\ChatMessageSent;
use App\Models\ChatMessage;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(): Response
    {
        $messages = ChatMessage::with('user:id,name')
            ->latest()
            ->limit(100)
            ->get()
            ->reverse()
            ->values();

        return Inertia::render('chat', [
            'messages' => $messages,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $message = ChatMessage::create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $message->load('user:id,name');

        try {
            broadcast(new ChatMessageSent($message))->toOthers();
        } catch (BroadcastException) {
            // Reverb not running — message is saved, just not broadcast
        }

        return back();
    }
}
