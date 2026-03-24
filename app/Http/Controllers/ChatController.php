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
        $user = auth()->user();
        $rover = $user->rover;
        $latestBattery = $rover?->latestTelemetry('battery');
        $latestTemp = $rover?->latestTelemetry('temperature');

        return Inertia::render('chat', [
            'messages' => [],
            'rover' => $rover,
            'latestBattery' => $latestBattery,
            'latestTemp' => $latestTemp,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $user = $request->user();

        try {
            broadcast(new ChatMessageSent($user, $validated['body']))->toOthers();
        } catch (BroadcastException) {
            // Reverb not running — just silently fail, message isn't persisted anyway
        }

        return back();
    }
}
