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
    private const POLL_MICROS_NEW = 5_000;
    private const POLL_MICROS_IDLE = 50_000;

    public function health(Request $request): JsonResponse
    {
        $rover = $request->user()?->rover;

        if (!$rover) {
            return response()->json(['status' => 'error', 'message' => 'No rover configured'], 404);
        }

        $path = FrameController::framePath($rover->id);
        $metaPath = FrameController::frameMetaPath($rover->id);
        $meta = $this->readFrameMeta($metaPath);

        if (!file_exists($path)) {
            return response()->json(['status' => 'error', 'message' => 'No frames received yet'], 404);
        }

        clearstatcache(true, $path);
        $age = $meta ? microtime(true) - $meta['timestamp'] : time() - filemtime($path);
        $bytes = $meta['bytes'] ?? filesize($path);

        return response()->json([
            'status' => $age <= self::FRAME_FRESH_SECONDS ? 'ok' : 'stale',
            'age_seconds' => round($age, 3),
            'bytes' => $bytes,
        ]);
    }

    public function proxy(Request $request): StreamedResponse
    {
        $rover = $request->user()?->rover;
        abort_unless($rover, 404);

        $path = FrameController::framePath($rover->id);
        $metaPath = FrameController::frameMetaPath($rover->id);

        @set_time_limit(0);
        @ignore_user_abort(false);

        return new StreamedResponse(function () use ($path, $metaPath) {
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            $startedAt = time();
            $lastMarker = '';

            while (!connection_aborted()) {
                if (time() - $startedAt > self::MAX_STREAM_SECONDS) {
                    return;
                }

                if (!is_file($path)) {
                    usleep(self::POLL_MICROS_IDLE);
                    continue;
                }

                $marker = is_file($metaPath) ? trim((string) @file_get_contents($metaPath)) : '';
                if ($marker === '') {
                    usleep(self::POLL_MICROS_IDLE);
                    continue;
                }

                if ($marker === $lastMarker) {
                    usleep(self::POLL_MICROS_NEW);
                    continue;
                }

                $meta = $this->parseFrameMeta($marker);
                if ($meta && microtime(true) - $meta['timestamp'] > self::FRAME_FRESH_SECONDS) {
                    usleep(self::POLL_MICROS_IDLE);
                    continue;
                }

                $frame = @file_get_contents($path);
                if ($frame === false || $frame === '') {
                    usleep(self::POLL_MICROS_NEW);
                    continue;
                }

                $lastMarker = $marker;

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
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function readFrameMeta(string $path): ?array
    {
        if (!is_file($path)) {
            return null;
        }

        return $this->parseFrameMeta(trim((string) @file_get_contents($path)));
    }

    private function parseFrameMeta(string $marker): ?array
    {
        $parts = explode('|', $marker);
        if (count($parts) < 2 || !is_numeric($parts[0]) || !is_numeric($parts[1])) {
            return null;
        }

        return [
            'timestamp' => (float) $parts[0],
            'bytes' => (int) $parts[1],
            'marker' => $marker,
        ];
    }
}
