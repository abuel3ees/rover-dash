<?php

namespace App\Http\Controllers\Api;

use App\Events\RoverStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateRoverStatusRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoverStatusController extends Controller
{
    public function heartbeat(Request $request): JsonResponse
    {
        // Get rover from token or X-Rover-Id header
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        $roverToken = $request->bearerToken();

        if (!$roverId && $roverToken) {
            $rover = \App\Models\Rover::whereHas('tokens', function ($q) use ($roverToken) {
                $q->where('token', hash('sha256', $roverToken));
            })->first();
        } else {
            $rover = \App\Models\Rover::find($roverId);
        }

        if (!$rover) {
            return response()->json(['message' => 'Rover Not Found or Invalid Token'], 404);
        }

        $wasOffline = ! $rover->isOnline();

        $rover->update([
            'last_seen_at' => now(),
            'status' => 'online',
        ]);

        if ($wasOffline) {
            broadcast(new RoverStatusChanged($rover));
        }

        return response()->json(['status' => 'ok']);
    }

    public function update(UpdateRoverStatusRequest $request): JsonResponse
    {
        // Get rover from token or X-Rover-Id header
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        $roverToken = $request->bearerToken();

        if (!$roverId && $roverToken) {
            $rover = \App\Models\Rover::whereHas('tokens', function ($q) use ($roverToken) {
                $q->where('token', hash('sha256', $roverToken));
            })->first();
        } else {
            $rover = \App\Models\Rover::find($roverId);
        }

        if (!$rover) {
            return response()->json(['message' => 'Rover Not Found or Invalid Token'], 404);
        }

        $rover->update($request->validated());
        $rover->update(['last_seen_at' => now()]);

        broadcast(new RoverStatusChanged($rover->fresh()));

        return response()->json(['status' => 'ok']);
    }
}
