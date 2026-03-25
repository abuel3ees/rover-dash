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
        // Find the rover by Sanctum OR the custom Header
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        
        $rover = $request->user() ?? \App\Models\Rover::where('id', $roverId)
                   ->orWhere('rover_id', $roverId) 
                   ->first();

        if (!$rover) {
            return response()->json(['message' => 'Rover not found'], 404);
        }

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
        // Apply the same fallback logic here so we don't crash when completing!
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        
        $rover = $request->user() ?? \App\Models\Rover::where('id', $roverId)
                   ->orWhere('rover_id', $roverId)
                   ->first();

        if (!$rover) {
            return response()->json(['message' => 'Rover not found'], 404);
        }

        // Security check: Make sure this rover actually owns this command
        if ($command->rover_id !== $rover->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $command->update([
            'status' => $request->validated('status') ?? 'completed', // Fallback just in case
            'executed_at' => now(),
            'response' => $request->validated('response'),
        ]);

        broadcast(new CommandCompleted($command));

        return response()->json(['status' => 'ok']);
    }
}