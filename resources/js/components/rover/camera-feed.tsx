import { RefreshCw, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CameraFeedProps {
    isOnline: boolean;
    streamUrl?: string | null;
}

export function CameraFeed({ isOnline, streamUrl }: CameraFeedProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Use dashboard proxy for remote streams, direct URL for local
    const src = streamUrl ?? '/rover/stream';
    const canTryStream = streamUrl ? true : isOnline;

    useEffect(() => {
        if (!canTryStream || hasError) {
            return;
        }

        const img = imgRef.current;

        if (!img) {
            return;
        }

        const controller = new AbortController();

        async function loadStream() {
            try {
                setLoading(true);
                setErrorMessage('');
                setDebugInfo('');

                // For MJPEG streams, we need to use img src directly
                // For remote streams (ngrok), use dashboard proxy
                const imageUrl = src.includes('ngrok') ? '/rover/stream' : src;

                if (!img) {
                    return;
                }

                img.src = imageUrl + `?t=${key}`;

                img.onload = () => {
                    setLoading(false);
                    setHasError(false);
                };

                img.onerror = () => {
                    setErrorMessage('Failed to load stream frame');
                    setDebugInfo('Check: 1) Stream URL correct 2) Server running 3) Network accessible');
                    setHasError(true);
                    setLoading(false);
                };

                // For continuous streaming, reload the image periodically
                const interval = setInterval(() => {
                    if (!controller.signal.aborted && img) {
                        img.src = imageUrl + `?t=${Date.now()}`;
                    }
                }, 1000); // Refresh every second

                return () => {
                    clearInterval(interval);
                };
            } catch (e: unknown) {
                const errorMsg = e instanceof Error ? e.message : 'Unknown error';
                setErrorMessage(errorMsg);
                setDebugInfo(`Check: 1) Pi camera server running 2) Stream URL correct 3) Network accessible. Error: ${errorMsg}`);
                setHasError(true);
                setLoading(false);
            }
        }

        const cleanup = loadStream();

        return () => {
            cleanup?.then((fn) => fn?.());
            controller.abort();
        };
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
            <img
                ref={imgRef}
                className="h-full w-full object-contain"
                alt="Camera feed"
            />
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
