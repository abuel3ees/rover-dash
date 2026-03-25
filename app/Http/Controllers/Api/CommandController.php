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
        // 1. Define the ID from the header first
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        
        // 2. Try Sanctum first, then fallback to manual lookup
        $rover = $request->user();

        if (!$rover && $roverId) {
            $rover = \App\Models\Rover::where(function($query) use ($roverId) {
                if (is_numeric($roverId)) {
                    $query->where('id', (int)$roverId);
                }
                // We use 'name' here because your DB shows "rover-01" is in the name column
                $query->orWhere('name', $roverId); 
            })->first();
        }

        if (!$rover) {
            return response()->json(['message' => 'Rover not found. Is rover_id correct?'], 404);
        }

        // 3. Process commands
        $commands = $rover->pendingCommands()->oldest()->get();

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
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        
        $rover = $request->user();

        if (!$rover && $roverId) {
            $rover = \App\Models\Rover::where(function($query) use ($roverId) {
                if (is_numeric($roverId)) {
                    $query->where('id', (int)$roverId);
                }
                $query->orWhere('name', $roverId);
            })->first();
        }

        if (!$rover) {
            return response()->json(['message' => 'Rover not found'], 404);
        }

        // Security check: Match the command to this specific rover
        if ($command->rover_id !== $rover->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $command->update([
            'status' => $request->validated('status') ?? 'completed',
            'executed_at' => now(),
            'response' => $request->validated('response'),
        ]);

        broadcast(new CommandCompleted($command));

        return response()->json(['status' => 'ok']);
    }
}