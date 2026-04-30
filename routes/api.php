<?php

use App\Http\Controllers\Api\CommandController;
use App\Http\Controllers\Api\FrameController;
use App\Http\Controllers\Api\HlsController;
use App\Http\Controllers\Api\RoverStatusController;
use App\Http\Controllers\Api\RoverSettingsController;
use App\Http\Controllers\Api\TelemetryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

    Route::post('rover/heartbeat', [RoverStatusController::class, 'heartbeat']);
    Route::post('rover/status', [RoverStatusController::class, 'update']);
    Route::patch('rover/settings', [RoverSettingsController::class, 'update']);

    // Camera frame relay (Pi pushes JPEG bytes; dashboard serves them via /rover/stream)
    Route::post('rover/frame', [FrameController::class, 'store']);
    Route::post('rover/hls/{filename}', [HlsController::class, 'store'])
        ->where('filename', '[A-Za-z0-9._-]+');

    // 2. Telemetry
    Route::post('telemetry', [TelemetryController::class, 'store']);
    Route::post('telemetry/batch', [TelemetryController::class, 'storeBatch']);

    // 3. Commands (The routes the Pi was looking for!)
    // The GET route for the Pi to fetch pending commands
    Route::get('rover/commands/pending', [CommandController::class, 'pending']);
    
    // The POST route for the Pi to mark a command as complete
    // (Changed from patch to post to match the Python script's requests.post)
    Route::post('rover/commands/{command}/complete', [CommandController::class, 'complete']);
