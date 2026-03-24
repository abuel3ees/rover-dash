<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StreamController extends Controller
{
    public function proxy(Request $request): StreamedResponse
    {
        $rover = $request->user()->rover;

        abort_unless($rover, 404);
        abort_unless($rover->stream_url, 404, 'No stream URL configured');

        $streamUrl = $rover->stream_url;

        return new StreamedResponse(function () use ($streamUrl) {
            $stream = @fopen($streamUrl, 'r');

            if (! $stream) {
                echo '--boundary--';

                return;
            }

            while (! feof($stream) && ! connection_aborted()) {
                $chunk = fread($stream, 8192);
                if ($chunk === false) {
                    break;
                }
                echo $chunk;
                flush();
            }

            fclose($stream);
        }, 200, [
            'Content-Type' => 'multipart/x-mixed-replace; boundary=--boundary',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
