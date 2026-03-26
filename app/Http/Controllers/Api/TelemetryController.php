<?php

namespace App\Http\Controllers\Api;

use App\Events\TelemetryReceived;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreBatchTelemetryRequest;
use App\Http\Requests\Api\StoreTelemetryRequest;
use App\Models\TelemetryData;
use Illuminate\Http\JsonResponse;

class TelemetryController extends Controller
{
    public function store(StoreTelemetryRequest $request): JsonResponse
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

        $telemetry = TelemetryData::create([
            'rover_id' => $rover->id,
            'type' => $request->validated('type'),
            'data' => $request->validated('data'),
            'recorded_at' => $request->validated('recorded_at'),
        ]);

        broadcast(new TelemetryReceived($telemetry));

        return response()->json(['id' => $telemetry->id], 201);
    }

    public function storeBatch(StoreBatchTelemetryRequest $request): JsonResponse
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

        $items = $request->validated('items');
        $ids = [];

        foreach ($items as $item) {
            $telemetry = TelemetryData::create([
                'rover_id' => $rover->id,
                'type' => $item['type'],
                'data' => $item['data'],
                'recorded_at' => $item['recorded_at'],
            ]);

            broadcast(new TelemetryReceived($telemetry));

            $ids[] = $telemetry->id;
        }

        return response()->json(['ids' => $ids], 201);
    }
}
