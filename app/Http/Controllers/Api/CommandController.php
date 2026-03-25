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
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        
        $rover = $request->user();

        // 1. Safe Lookup: Only search the integer 'id' if the value is a number
        if (!$rover && $roverId) {
            $rover = \App\Models\Rover::where(function($query) use ($roverId) {
                if (is_numeric($roverId)) {
                    $query->where('id', $roverId);
                }
                $query->orWhere('rover_id', $roverId); // Search string column
            })->first();
        }

        if (!$rover) {
            return response()->json(['message' => 'Rover not found. Is rover_id correct in DB?'], 404);
        }

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

        // Safe Lookup for Complete method too
        if (!$rover && $roverId) {
            $rover = \App\Models\Rover::where(function($query) use ($roverId) {
                if (is_numeric($roverId)) {
                    $query->where('id', $roverId);
                }
                $query->orWhere('rover_id', $roverId);
            })->first();
        }

        if (!$rover) {
            return response()->json(['message' => 'Rover not found'], 404);
        }

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