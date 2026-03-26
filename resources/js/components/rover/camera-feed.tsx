import { VideoOff } from 'lucide-react';

interface CameraFeedProps {
    isOnline: boolean;
    streamUrl?: string | null;
}

export function CameraFeed({ isOnline, streamUrl }: CameraFeedProps) {
    // Extract Twitch channel name from various URL formats
    const getTwitchChannelName = (url?: string | null): string | null => {
        if (!url) {
            return null;
        }

        try {
            // Handle twitch.tv/channelname
            const urlObj = new URL(url);

            if (urlObj.hostname.includes('twitch.tv')) {
                return urlObj.pathname.slice(1); // Remove leading /
            }

            // Handle just the channel name
            if (url && !url.includes('/') && !url.includes('.')) {
                return url;
            }
        } catch {
            return null;
        }

        return null;
    };

    const twitchChannel = getTwitchChannelName(streamUrl);

    if (!isOnline || !twitchChannel) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-4">
                <VideoOff className="size-8 text-muted-foreground/30" />
                <div className="flex flex-col items-center gap-2 max-w-xs">
                    <p className="text-xs text-muted-foreground/50 tracking-wide text-center">
                        {!isOnline
                            ? 'Rover offline'
                            : !twitchChannel
                            ? 'No Twitch stream configured. Set stream URL in rover settings'
                            : 'Stream unavailable'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-black">
            {/* Twitch Embedded Player */}
            <iframe
                className="w-full h-full"
                src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}&autoplay=true&muted=true`}
                title="Rover Camera Feed"
                allowFullScreen
                frameBorder="0"
                scrolling="no"
            />

            {/* Live Indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-sm z-10">
                <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                </span>
                Live
            </div>
        </div>
    );
}
