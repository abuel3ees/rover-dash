<?php

namespace App\Http\Controllers;

use App\Events\WhisperSent;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WhisperController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:500',
            'recipient_id' => 'required|integer|exists:users,id',
        ]);

        $sender = $request->user();

        // Prevent whispering to yourself
        if ((int) $validated['recipient_id'] === $sender->id) {
            return back();
        }

        try {
            broadcast(new WhisperSent($sender, (int) $validated['recipient_id'], $validated['body']));
        } catch (BroadcastException) {
            // Reverb not running — silently fail
        }

        return back();
    }
}
