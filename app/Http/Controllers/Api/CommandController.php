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
        $rover = $request->user();

        $commands = $rover->pendingCommands()
            ->oldest()
            ->get();

        // Mark retrieved commands as sent
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
