<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StreamController extends Controller
{
    public function proxy(Request $request): StreamedResponse
    {
        $rover = $request->user()->rover;

        abort_unless($rover, 404);
        abort_unless($rover->stream_url, 404, 'No stream URL configured');

        $streamUrl = $rover->stream_url;

        set_time_limit(0);

        $client = new Client(['verify' => false]);

        try {
            Log::info('Attempting to proxy stream', ['url' => $streamUrl]);

            $upstream = $client->get($streamUrl, [
                'headers' => [
                    'ngrok-skip-browser-warning' => 'true',
                    'User-Agent' => 'RoverDashboard/1.0',
                    'Accept' => 'image/jpeg, multipart/x-mixed-replace',
                ],
                'stream' => true,
                'connect_timeout' => 15,
                'timeout' => 30,
                'read_timeout' => 30,
            ]);

            Log::info('Stream connection established', [
                'status' => $upstream->getStatusCode(),
                'content_type' => $upstream->getHeaderLine('Content-Type'),
            ]);
        } catch (GuzzleException $e) {
            Log::error('Stream proxy failed', [
                'url' => $streamUrl,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);
            abort(502, 'Failed to connect to camera stream: ' . $e->getMessage());
        }

        $body = $upstream->getBody();
        $contentType = $upstream->getHeaderLine('Content-Type') ?: 'multipart/x-mixed-replace; boundary=frame';

        return new StreamedResponse(function () use ($body) {
            // Disable all output buffering so frames reach the browser immediately
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            while (! $body->eof() && ! connection_aborted()) {
                echo $body->read(8192);
                ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
