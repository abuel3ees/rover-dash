<?php

use App\Http\Controllers\ControlController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoverController;
use App\Http\Controllers\RoverTokenController;
use App\Http\Controllers\StreamController;
use App\Http\Controllers\TelemetryWebController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rover setup & settings
    Route::get('rover/setup', [RoverController::class, 'create'])->name('rover.create');
    Route::post('rover', [RoverController::class, 'store'])->name('rover.store');
    Route::get('rover/settings', [RoverController::class, 'edit'])->name('rover.edit');
    Route::put('rover', [RoverController::class, 'update'])->name('rover.update');
    Route::delete('rover', [RoverController::class, 'destroy'])->name('rover.destroy');

    // Rover API token management
    Route::post('rover/token', [RoverTokenController::class, 'store'])->name('rover.token.store');
    Route::delete('rover/token', [RoverTokenController::class, 'destroy'])->name('rover.token.destroy');

    // Control interface
    Route::get('control', [ControlController::class, 'index'])->name('control');
    Route::post('control/command', [ControlController::class, 'sendCommand'])->name('control.command');

    // Telemetry
    Route::get('telemetry', [TelemetryWebController::class, 'index'])->name('telemetry');

    // Camera stream proxy
    Route::get('rover/stream', [StreamController::class, 'proxy'])->name('rover.stream');
});

require __DIR__.'/settings.php';
