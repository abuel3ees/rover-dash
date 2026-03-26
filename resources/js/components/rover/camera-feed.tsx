import { RefreshCw, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CameraFeedProps {
    isOnline: boolean;
    streamUrl?: string | null;
}

export function CameraFeed({ isOnline, streamUrl }: CameraFeedProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Use dashboard proxy for remote streams, direct URL for local
    const src = streamUrl ?? '/rover/stream';
    const canTryStream = streamUrl ? true : isOnline;

    useEffect(() => {
        if (!canTryStream || hasError) {
            return;
        }

        const iframe = iframeRef.current;
        if (!iframe) {
            return;
        }

        try {
            setErrorMessage('');
            setDebugInfo('');

            // For MJPEG streams, we use an iframe with an img src pointing to the continuous stream
            // This allows the browser to handle the MJPEG stream natively at full frame rate
            const streamSrc = src.includes('ngrok') ? '/rover/stream' : src;
            
            // Create HTML content that displays the MJPEG stream
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; padding: 0; background: #000; overflow: hidden; }
                        img { 
                            display: block; 
                            width: 100%; 
                            height: 100%; 
                            object-fit: contain;
                            background: #000;
                        }
                    </style>
                </head>
                <body>
                    <img src="${streamSrc}?t=${Date.now()}" alt="Camera feed" />
                </body>
                </html>
            `;

            iframe.srcdoc = htmlContent;

            // Handle errors
            iframe.onerror = () => {
                setErrorMessage('Failed to load stream');
                setDebugInfo('Check: 1) Stream URL correct 2) Server running 3) Network accessible');
                setHasError(true);
            };

            // Try to load after a short delay to catch CORS or other errors
            const timeout = setTimeout(() => {
                // Keep trying - MJPEG streams are continuous
            }, 2000);

            return () => {
                clearTimeout(timeout);
            };
        } catch (e: unknown) {
            const errorMsg = e instanceof Error ? e.message : 'Unknown error';
            setErrorMessage(errorMsg);
            setDebugInfo(`Check: 1) Pi camera server running 2) Stream URL correct 3) Network accessible. Error: ${errorMsg}`);
            setHasError(true);
        }
    }, [src, canTryStream, hasError]);

    function reconnect() {
        setHasError(false);
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
            <iframe
                ref={iframeRef}
                className="h-full w-full border-0"
                title="Camera feed"
                sandbox="allow-same-origin"
                style={{ display: hasError ? 'none' : 'block' }}
            />
            {!hasError && (
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
