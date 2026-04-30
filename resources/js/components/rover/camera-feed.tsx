import { VideoOff } from 'lucide-react';

interface CameraFeedProps {
    isOnline: boolean;
    streamUrl?: string | null;
}

export function CameraFeed({ isOnline, streamUrl }: CameraFeedProps) {
    const getYouTubeEmbedUrl = (url?: string | null): string | null => {
        if (!url) {
            return null;
        }

        const trimmed = url.trim();

        try {
            const urlObj = new URL(trimmed);
            const hostname = urlObj.hostname.replace(/^www\./, '');

            if (hostname === 'youtu.be') {
                const videoId = urlObj.pathname.slice(1);
                return videoId
                    ? `https://www.youtube.com/embed/${videoId}`
                    : null;
            }

            if (!hostname.includes('youtube.com')) {
                return null;
            }

            const watchId = urlObj.searchParams.get('v');
            if (watchId) {
                return `https://www.youtube.com/embed/${watchId}`;
            }

            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts[0] === 'embed' && pathParts[1]) {
                return `https://www.youtube.com/embed/${pathParts[1]}`;
            }

            if (pathParts[0] === 'live' && pathParts[1]) {
                return `https://www.youtube.com/embed/${pathParts[1]}`;
            }

            if (pathParts[0] === 'channel' && pathParts[1]) {
                return `https://www.youtube.com/embed/live_stream?channel=${pathParts[1]}`;
            }
        } catch {
            return null;
        }

        return null;
    };

    const youtubeEmbedUrl = getYouTubeEmbedUrl(streamUrl);
    const embedSeparator = youtubeEmbedUrl?.includes('?') ? '&' : '?';

    if (!isOnline || !youtubeEmbedUrl) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-4">
                <VideoOff className="size-8 text-muted-foreground/30" />
                <div className="flex max-w-xs flex-col items-center gap-2">
                    <p className="text-center text-xs tracking-wide text-muted-foreground/50">
                        {!isOnline
                            ? 'Rover offline'
                            : !youtubeEmbedUrl
                              ? 'No YouTube stream configured'
                              : 'Stream unavailable'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-black">
            <iframe
                className="h-full w-full"
                src={`${youtubeEmbedUrl}${embedSeparator}autoplay=1&mute=1&playsinline=1`}
                title="Rover Camera Feed"
                allowFullScreen
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
