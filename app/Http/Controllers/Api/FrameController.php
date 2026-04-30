<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rover;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FrameController extends Controller
{
    public const MAX_FRAME_BYTES = 1_500_000;

    public function store(Request $request): JsonResponse
    {
        $rover = $this->resolveRover($request);

        if (!$rover) {
            return response()->json(['message' => 'Rover Not Found or Invalid Token'], 404);
        }

        $bytes = $request->getContent();
        $size = strlen($bytes);

        if ($size === 0) {
            return response()->json(['message' => 'Empty frame'], 400);
        }

        if ($size > self::MAX_FRAME_BYTES) {
            return response()->json(['message' => 'Frame too large'], 413);
        }

        $path = self::framePath($rover->id);
        @mkdir(dirname($path), 0755, true);

        $tmp = $path . '.tmp';
        if (@file_put_contents($tmp, $bytes) === false) {
            return response()->json(['message' => 'Failed to persist frame'], 500);
        }
        if (! @rename($tmp, $path)) {
            return response()->json(['message' => 'Failed to publish frame'], 500);
        }

        $marker = sprintf('%.6f|%d|%s', microtime(true), $size, bin2hex(random_bytes(4)));
        $metaPath = self::frameMetaPath($rover->id);
        $metaTmp = $metaPath . '.tmp';
        if (@file_put_contents($metaTmp, $marker) === false || ! @rename($metaTmp, $metaPath)) {
            return response()->json(['message' => 'Failed to publish frame marker'], 500);
        }

        return response()->noContent();
    }

    public static function framePath(int $roverId): string
    {
        return storage_path("app/stream/rover-{$roverId}.jpg");
    }

    public static function frameMetaPath(int $roverId): string
    {
        return storage_path("app/stream/rover-{$roverId}.meta");
    }

    private function resolveRover(Request $request): ?Rover
    {
        $roverId = $request->header('X-Rover-Id') ?? $request->query('rover_id');
        $token = $request->bearerToken();

        if (!$roverId && $token) {
            return Rover::whereHas('tokens', function ($q) use ($token) {
                $q->where('token', hash('sha256', $token));
            })->first();
        }

        return $roverId ? Rover::find($roverId) : null;
    }
}
