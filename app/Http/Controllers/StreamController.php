<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\FrameController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StreamController extends Controller
{
    private const MAX_STREAM_SECONDS = 1800;
    private const FRAME_FRESH_SECONDS = 3;
    private const POLL_MICROS_NEW = 15_000;
    private const POLL_MICROS_IDLE = 100_000;

    public function health(Request $request): JsonResponse
    {
        $rover = $request->user()?->rover;

        if (!$rover) {
            return response()->json(['status' => 'error', 'message' => 'No rover configured'], 404);
        }

        $path = FrameController::framePath($rover->id);
        clearstatcache(true, $path);

        if (!file_exists($path)) {
            return response()->json(['status' => 'error', 'message' => 'No frames received yet'], 404);
        }

        $age = time() - filemtime($path);

        return response()->json([
            'status' => $age <= self::FRAME_FRESH_SECONDS ? 'ok' : 'stale',
            'age_seconds' => $age,
            'bytes' => filesize($path),
        ]);
    }

    public function proxy(Request $request): StreamedResponse
    {
        $rover = $request->user()?->rover;
        abort_unless($rover, 404);

        $path = FrameController::framePath($rover->id);

        @set_time_limit(0);
        @ignore_user_abort(false);

        return new StreamedResponse(function () use ($path) {
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            $startedAt = time();
            $lastMtime = 0;

            while (!connection_aborted()) {
                if (time() - $startedAt > self::MAX_STREAM_SECONDS) {
                    return;
                }

                clearstatcache(true, $path);
                if (!file_exists($path)) {
                    usleep(self::POLL_MICROS_IDLE);
                    continue;
                }

                $mtime = filemtime($path);
                if ($mtime === $lastMtime) {
                    usleep(self::POLL_MICROS_NEW);
                    continue;
                }

                if (time() - $mtime > self::FRAME_FRESH_SECONDS) {
                    usleep(self::POLL_MICROS_IDLE);
                    continue;
                }

                $frame = @file_get_contents($path);
                if ($frame === false || $frame === '') {
                    usleep(self::POLL_MICROS_NEW);
                    continue;
                }

                $lastMtime = $mtime;

                echo "--frame\r\n";
                echo "Content-Type: image/jpeg\r\n";
                echo 'Content-Length: ' . strlen($frame) . "\r\n\r\n";
                echo $frame;
                echo "\r\n";
                @ob_flush();
                @flush();
            }
        }, 200, [
            'Content-Type' => 'multipart/x-mixed-replace; boundary=frame',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
