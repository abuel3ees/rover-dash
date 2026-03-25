<?php

namespace App\Http\Controllers\Api;

use App\Events\CommandCompleted;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CompleteCommandRequest;
use App\Models\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommandController extends Controller
{
    public function pending(Request $request): JsonResponse
{
    // 1. Find the rover by the ID passed in the request URL/headers
    $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
    
    $rover = \App\Models\Rover::where('id', $roverId)
               ->orWhere('rover_id', $roverId) // Depending on your DB column name
               ->first();

    if (!$rover) {
        return response()->json(['message' => 'Rover not found'], 404);
    }

    // 2. The rest of your code stays exactly the same
    $commands = $rover->pendingCommands()
        ->oldest()
        ->get();

    $commands->each(function (Command $command) {
        $command->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    });

    return response()->json([
        'commands' => $commands->map(fn (Command $cmd) => [
            'id' => $cmd->id,
            'type' => $cmd->type,
            'payload' => $cmd->payload,
        ]),
    ]);
}

    public function complete(CompleteCommandRequest $request, Command $command): JsonResponse
    {
        $rover = $request->user();

        if ($command->rover_id !== $rover->id) {
            abort(403);
        }

        $command->update([
            'status' => $request->validated('status'),
            'executed_at' => now(),
            'response' => $request->validated('response'),
        ]);

        broadcast(new CommandCompleted($command));

        return response()->json(['status' => 'ok']);
    }
}
