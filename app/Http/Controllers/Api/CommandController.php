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
        
        // Let's be very aggressive in finding the rover locally
        $rover = $request->user() ?? \App\Models\Rover::where('name', 'rover-01')
                   ->orWhere('id', 1) 
                   ->first();

        if (!$rover) {
            return response()->json(['message' => 'Local Rover Not Found'], 404);
        }

        $commands = $rover->pendingCommands()->oldest()->get();

        $commands->each(function (Command $command) {
            $command->update(['status' => 'sent', 'sent_at' => now()]);
        });

        return response()->json([
            'commands' => $commands->map(fn ($cmd) => [
                'id' => $cmd->id,
                'type' => $cmd->type,
                'payload' => $cmd->payload,
            ]),
        ]);
    }

    public function complete(CompleteCommandRequest $request, Command $command): JsonResponse
    {
        $rover = $request->user() ?? \App\Models\Rover::first();

        $command->update([
            'status' => $request->validated('status') ?? 'completed',
            'executed_at' => now(),
            'response' => $request->validated('response'),
        ]);

        broadcast(new CommandCompleted($command));

        return response()->json(['status' => 'ok']);
    }
}