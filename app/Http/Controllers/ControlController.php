<?php

namespace App\Http\Controllers;

use App\Events\CommandSent;
use App\Http\Requests\StoreCommandRequest;
use App\Models\Command;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ControlController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $rover = $request->user()->rover;

        if (! $rover) {
            return to_route('rover.create');
        }

        return Inertia::render('control', [
            'rover' => [
                'id' => $rover->id,
                'name' => $rover->name,
                'status' => $rover->status,
                'stream_url' => $rover->stream_url,
                'ip_address' => $rover->ip_address,
                'stream_port' => $rover->stream_port,
                'last_seen_at' => $rover->last_seen_at,
                'is_online' => $rover->isOnline(),
            ],
            'latestTelemetry' => [
                'gps' => $rover->latestTelemetry('gps'),
                'battery' => $rover->latestTelemetry('battery'),
                'temperature' => $rover->latestTelemetry('temperature'),
            ],
            'recentCommands' => $rover->commands()->latest()->take(20)->get(),
        ]);
    }

    public function sendCommand(StoreCommandRequest $request): RedirectResponse
    {
        $rover = $request->user()->rover;

        abort_unless($rover, 404);

        $command = Command::create([
            'rover_id' => $rover->id,
            'user_id' => $request->user()->id,
            'type' => $request->validated('type'),
            'payload' => $request->validated('payload'),
        ]);

        if (in_array($command->type, ['auto_follow', 'stop'], true)) {
            $rover->commands()
                ->where('id', '<', $command->id)
                ->where('status', 'pending')
                ->whereIn('type', ['manual_override', 'move', 'rotate', 'speed', 'stop'])
                ->update(['status' => 'expired']);
        }

        broadcast(new CommandSent($command))->toOthers();

        return back();
    }
}
