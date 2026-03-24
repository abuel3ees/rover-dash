<?php

use App\Http\Controllers\Api\CommandController;
use App\Http\Controllers\Api\RoverStatusController;
use App\Http\Controllers\Api\TelemetryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Rover heartbeat & status
    Route::post('rover/heartbeat', [RoverStatusController::class, 'heartbeat']);
    Route::post('rover/status', [RoverStatusController::class, 'update']);

    // Telemetry
    Route::post('telemetry', [TelemetryController::class, 'store']);
    Route::post('telemetry/batch', [TelemetryController::class, 'storeBatch']);

    // Commands (Pi polls for pending commands)
Route::patch('commands/{command}/complete', [CommandController::class, 'complete']);

Route::post('/rover/heartbeat', function (Request $request) {
Route::post('/rover/heartbeat', function (Request $request) {
    // For now, let's just log it to see if it works
    \Log::info('Rover Heartbeat Received:', $request->all());

    return response()->json([
        'status' => 'success',
        'message' => 'Heartbeat received at ' . now(),
        'commands' => [] // We will put movement commands here later
    ]);
});
});
});