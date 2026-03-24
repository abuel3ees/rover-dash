<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ControlController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\MessagePinController;
use App\Http\Controllers\MessageReactionController;
use App\Http\Controllers\MessageSearchController;
use App\Http\Controllers\ReadReceiptController;
use App\Http\Controllers\RoverController;
use App\Http\Controllers\RoverTokenController;
use App\Http\Controllers\StreamController;
use App\Http\Controllers\TelemetryWebController;
use App\Http\Controllers\UserDirectoryController;
use App\Http\Controllers\WhisperController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Setup guide
    Route::inertia('setup', 'setup')->name('setup');

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

    // Chat (legacy ephemeral channels)
    Route::get('chat', [ChatController::class, 'index'])->name('chat');
    Route::post('chat', [ChatController::class, 'store'])->name('chat.store');
    Route::post('chat/whisper', [WhisperController::class, 'store'])->name('chat.whisper.store');

    // Messaging
    Route::prefix('messaging')->name('messaging.')->group(function () {
        Route::get('/', [ConversationController::class, 'index'])->name('index');
        Route::post('/conversations', [ConversationController::class, 'store'])->name('conversations.store');
        Route::get('/conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');

        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store'])->name('messages.store');
        Route::patch('/conversations/{conversation}/messages/{message}', [MessageController::class, 'update'])->name('messages.update');
        Route::delete('/conversations/{conversation}/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

        Route::post('/conversations/{conversation}/messages/{message}/reactions', [MessageReactionController::class, 'store'])->name('reactions.store');
        Route::post('/conversations/{conversation}/messages/{message}/pin', [MessagePinController::class, 'store'])->name('messages.pin');

        Route::post('/conversations/{conversation}/read', [ReadReceiptController::class, 'store'])->name('conversations.read');
        Route::get('/conversations/{conversation}/search', [MessageSearchController::class, 'index'])->name('messages.search');

        Route::get('/users', [UserDirectoryController::class, 'index'])->name('users.index');
    });
});

require __DIR__.'/settings.php';
