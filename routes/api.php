<?php

use App\Http\Controllers\Api\CommandController;
use App\Http\Controllers\Api\RoverStatusController;
use App\Http\Controllers\Api\TelemetryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Rover heartbeat & status
    Route::post('rover/heartbeat', [RoverStatusController::class, 'heartbeat']);
    Route::post('rover/status', [RoverStatusController::class, 'update']);

    // Telemetry
    Route::post('telemetry', [TelemetryController::class, 'store']);
    Route::post('telemetry/batch', [TelemetryController::class, 'storeBatch']);

    // Commands (Pi polls for pending commands)
    Route::get('commands/pending', [CommandController::class, 'pending']);
    Route::patch('commands/{command}/complete', [CommandController::class, 'complete']);
});
