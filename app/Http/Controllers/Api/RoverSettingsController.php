<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        \Log::info('RoverSettingsController.update called', [
            'roverId' => $roverId,
            'has_token' => !empty($roverToken),
            'body' => $request->all(),
        ]);

        if (!$roverId && $roverToken) {
            $rover = Rover::whereHas('tokens', function ($q) use ($roverToken) {
                $q->where('token', hash('sha256', $roverToken));
            })->first();
        } else {
            $rover = Rover::find($roverId);
        }

        if (!$rover) {
            \Log::warning('Rover not found', ['roverId' => $roverId, 'has_token' => !empty($roverToken)]);
            return response()->json(['message' => 'Rover Not Found or Invalid Token'], 404);
        }

        \Log::info('Rover found', ['rover_id' => $rover->id, 'rover_name' => $rover->name]);

        // Only allow certain fields to be updated
        $updateable = ['stream_url', 'ip_address', 'stream_port', 'status', 'hardware_info'];
        $data = $request->only($updateable);

        \Log::info('Data to update', ['data' => $data]);

        if (empty($data)) {
            \Log::warning('No valid fields to update');
            return response()->json(['message' => 'No valid fields to update'], 400);
        }

        try {
            $rover->update($data);
            \Log::info('Rover updated successfully', ['rover_id' => $rover->id, 'updated_data' => $data]);
        } catch (\Exception $e) {
            \Log::error('Error updating rover', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating rover', 'error' => $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'Rover settings updated',
            'rover' => $rover->refresh()->only($updateable)
        ], 200);
    }
}
