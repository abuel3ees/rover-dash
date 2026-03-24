import { RefreshCw, VideoOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CameraFeed({ isOnline }: { isOnline: boolean }) {
    const [hasError, setHasError] = useState(false);
    const [key, setKey] = useState(0);

    function reconnect() {
        setHasError(false);
        setKey((k) => k + 1);
    }

    if (!isOnline || hasError) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border bg-muted/50">
                <VideoOff className="size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    {!isOnline
                        ? 'Rover is offline'
                        : 'Stream unavailable'}
                </p>
                {hasError && (
                    <Button variant="outline" size="sm" onClick={reconnect}>
                        <RefreshCw className="mr-1 size-4" />
                        Reconnect
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
            <img
                key={key}
                src="/rover/stream"
                alt="Rover camera feed"
                className="size-full object-contain"
                onError={() => setHasError(true)}
            />
            <div className="absolute top-2 left-2">
                <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                    <span className="size-2 animate-pulse rounded-full bg-red-500" />
                    LIVE
                </span>
            </div>
        </div>
    );
}
