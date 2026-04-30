import { VideoOff } from 'lucide-react';

interface CameraFeedProps {
    isOnline: boolean;
    streamUrl?: string | null;
}

export function CameraFeed({ isOnline, streamUrl }: CameraFeedProps) {
    const hasStream = Boolean(streamUrl?.trim());

    if (!isOnline || !hasStream) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-4">
                <VideoOff className="size-8 text-muted-foreground/30" />
                <div className="flex max-w-xs flex-col items-center gap-2">
                    <p className="text-center text-xs tracking-wide text-muted-foreground/50">
                        {!isOnline
                            ? 'Rover offline'
                            : !hasStream
                              ? 'No stream URL configured'
                              : 'Stream unavailable'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-black">
            <img
                className="h-full w-full object-cover"
                src="/rover/stream"
                alt="Rover Stream Feed"
            />

            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[10px] font-medium tracking-widest text-white uppercase backdrop-blur-sm">
                <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                </span>
                Live
            </div>
        </div>
    );
}
