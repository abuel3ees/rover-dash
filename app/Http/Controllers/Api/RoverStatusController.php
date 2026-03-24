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
        $rover = $request->user();

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
        $rover = $request->user();

        $rover->update($request->validated());
        $rover->update(['last_seen_at' => now()]);

        broadcast(new RoverStatusChanged($rover->fresh()));

        return response()->json(['status' => 'ok']);
    }
}
