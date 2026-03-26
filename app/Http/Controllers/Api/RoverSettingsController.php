<?php

namespace App\Http\Controllers\Api;

use App\Models\Rover;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoverSettingsController extends Controller
{
    /**
     * Update rover settings (stream_url, etc) via API
     * Called by Pi client to update stream URL
     */
    public function update(Request $request): JsonResponse
    {
        // Get rover from token or X-Rover-Id header
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        $roverToken = $request->bearerToken();

        if (!$roverId && $roverToken) {
            $rover = Rover::whereHas('tokens', function ($q) use ($roverToken) {
                $q->where('token', hash('sha256', $roverToken));
            })->first();
        } else {
            $rover = Rover::find($roverId);
        }

        if (!$rover) {
            return response()->json(['message' => 'Rover Not Found or Invalid Token'], 404);
        }

        // Only allow certain fields to be updated
        $updateable = ['stream_url', 'ip_address', 'stream_port', 'status', 'hardware_info'];
        $data = $request->only($updateable);

        if (empty($data)) {
            return response()->json(['message' => 'No valid fields to update'], 400);
        }

        $rover->update($data);

        return response()->json([
            'message' => 'Rover settings updated',
            'rover' => $rover->only($updateable)
        ], 200);
    }
}
