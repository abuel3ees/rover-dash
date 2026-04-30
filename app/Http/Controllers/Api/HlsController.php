<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rover;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class HlsController extends Controller
{
    private const MAX_UPLOAD_BYTES = 8_000_000;
    private const SEGMENT_TTL_SECONDS = 180;
    private const ALLOWED_EXTENSIONS = ['m3u8', 'ts', 'm4s', 'mp4'];

    public function store(Request $request, string $filename): Response
    {
        $rover = $this->resolveRover($request);

        if (!$rover) {
            return response()->json(['message' => 'Rover Not Found or Invalid Token'], 404);
        }

        if (!$this->isSafeFilename($filename)) {
            return response()->json(['message' => 'Invalid HLS filename'], 422);
        }

        $bytes = $request->getContent();
        $size = strlen($bytes);

        if ($size === 0) {
            return response()->json(['message' => 'Empty HLS upload'], 400);
        }

        if ($size > self::MAX_UPLOAD_BYTES) {
            return response()->json(['message' => 'HLS upload too large'], 413);
        }

        $dir = self::hlsDirectory($rover->id);
        @mkdir($dir, 0755, true);

        $path = $dir . DIRECTORY_SEPARATOR . $filename;
        $tmp = $path . '.tmp';

        if (@file_put_contents($tmp, $bytes, LOCK_EX) === false || !@rename($tmp, $path)) {
            return response()->json(['message' => 'Failed to persist HLS upload'], 500);
        }

        $this->cleanupOldSegments($dir);

        return response()->noContent();
    }

    public function show(Request $request, string $filename): BinaryFileResponse|Response
    {
        $rover = $request->user()?->rover;

        if (!$rover) {
            abort(404);
        }

        if (!$this->isSafeFilename($filename)) {
            abort(404);
        }

        $path = self::hlsDirectory($rover->id) . DIRECTORY_SEPARATOR . $filename;

        if (!is_file($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type' => $this->contentType($filename),
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public static function hlsDirectory(int $roverId): string
    {
        return storage_path("app/hls/rover-{$roverId}");
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

    private function isSafeFilename(string $filename): bool
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        return basename($filename) === $filename
            && preg_match('/^[A-Za-z0-9._-]+$/', $filename)
            && in_array($extension, self::ALLOWED_EXTENSIONS, true);
    }

    private function contentType(string $filename): string
    {
        return match (strtolower(pathinfo($filename, PATHINFO_EXTENSION))) {
            'm3u8' => 'application/vnd.apple.mpegurl',
            'ts' => 'video/mp2t',
            'm4s' => 'video/iso.segment',
            'mp4' => 'video/mp4',
            default => 'application/octet-stream',
        };
    }

    private function cleanupOldSegments(string $dir): void
    {
        $cutoff = time() - self::SEGMENT_TTL_SECONDS;

        foreach (glob($dir . DIRECTORY_SEPARATOR . '*') ?: [] as $path) {
            if (!is_file($path) || str_ends_with($path, '.m3u8')) {
                continue;
            }

            if (@filemtime($path) !== false && filemtime($path) < $cutoff) {
                @unlink($path);
            }
        }
    }
}
