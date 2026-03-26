import { RefreshCw, VideoOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CameraFeedProps {
    isOnline: boolean;
    streamUrl?: string | null;
}

export function CameraFeed({ isOnline, streamUrl }: CameraFeedProps) {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Use dashboard proxy for remote streams, direct URL for local
    const src = streamUrl ?? '/rover/stream';
    const canTryStream = streamUrl ? true : isOnline;

    function reconnect() {
        setHasError(false);
        setErrorMessage('');
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
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-black flex items-center justify-center">
            <img
                src={src}
                alt="Camera feed"
                className="max-w-full max-h-full"
                onError={() => {
                    setErrorMessage('Failed to load stream');
                    setHasError(true);
                }}
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
