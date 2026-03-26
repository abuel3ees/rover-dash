import { RefreshCw, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CameraFeedProps {
    isOnline: boolean;
    streamUrl?: string | null;
}

export function CameraFeed({ isOnline, streamUrl }: CameraFeedProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [debugInfo, setDebugInfo] = useState<string>('');

    const src = streamUrl ?? '/rover/stream';
    const canTryStream = streamUrl ? true : isOnline;

    useEffect(() => {
        if (!canTryStream || hasError) {
            return;
        }

        const controller = new AbortController();
        const headers: Record<string, string> = {
            'Accept': 'image/jpeg',
        };

        if (src.includes('ngrok')) {
            headers['ngrok-skip-browser-warning'] = 'true';
        }

        let buffer = new Uint8Array(0);

        async function run() {
            try {
                const res = await fetch(src, {
                    signal: controller.signal,
                    headers,
                    mode: 'cors',
                });

                if (!res.ok || !res.body) {
                    setHasError(true);
                    return;
                }

                const reader = res.body.getReader();

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        break;
                    }

                    const merged = new Uint8Array(buffer.length + value.length);

                    merged.set(buffer);
                    merged.set(value, buffer.length);
                    buffer = merged;

                    let start = -1;

                    for (let i = 0; i < buffer.length - 1; i++) {
                        if (buffer[i] === 0xff && buffer[i + 1] === 0xd8) {
                            start = i;
                        }

                        if (start !== -1 && buffer[i] === 0xff && buffer[i + 1] === 0xd9) {
                            const jpeg = buffer.slice(start, i + 2);

                            buffer = buffer.slice(i + 2);

                            const blob = new Blob([jpeg], { type: 'image/jpeg' });
                            const url = URL.createObjectURL(blob);
                            const img = new Image();

                            img.onload = () => {
                                setLoading(false);

                                const canvas = canvasRef.current;

                                if (canvas) {
                                    canvas.width = img.naturalWidth;
                                    canvas.height = img.naturalHeight;
                                    canvas.getContext('2d')?.drawImage(img, 0, 0);
                                }

                                URL.revokeObjectURL(url);
                            };

                            img.src = url;
                            start = -1;

                            break;
                        }
                    }
                }
            } catch (e: unknown) {
                if (e instanceof DOMException && e.name === 'AbortError') {
                    return;
                }

                const errorMsg = e instanceof Error ? e.message : 'Unknown error';
                setErrorMessage(errorMsg);
                setDebugInfo(`Check: 1) Pi camera server running 2) Stream URL correct 3) Network accessible. Error: ${errorMsg}`);
                setHasError(true);
                setLoading(false);
            }
        }

        run();

        return () => controller.abort();
    }, [src, canTryStream, hasError, key]);

    function reconnect() {
        setHasError(false);
        setLoading(true);
        setKey((k) => k + 1);
    }

    if (!canTryStream || hasError) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-4">
                <VideoOff className="size-8 text-muted-foreground/30" />
                <div className="flex flex-col items-center gap-2 max-w-xs">
                    <p className="text-xs text-muted-foreground/50 tracking-wide text-center">
                        {hasError 
                            ? errorMessage || 'Stream unavailable - check camera server and network connection' 
                            : 'Rover offline'}
                    </p>
                    {debugInfo && (
                        <p className="text-[10px] text-muted-foreground/40 text-center font-mono bg-background/50 p-2 rounded max-h-16 overflow-y-auto w-full">
                            {debugInfo}
                        </p>
                    )}
                </div>
                {hasError && (
                    <Button variant="outline" size="sm" className="h-7 rounded-lg text-xs" onClick={reconnect}>
                        <RefreshCw className="mr-1.5 size-3" />
                        Reconnect
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-black">
            <canvas ref={canvasRef} className="h-full w-full object-contain" />
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                </div>
            )}
            {!loading && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-sm">
                    <span className="relative flex size-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                    </span>
                    Live
                </div>
            )}
        </div>
    );
}
