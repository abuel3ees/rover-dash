import { VideoOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface CameraFeedProps {
    isOnline: boolean;
    streamUrl?: string | null;
}

const DASHBOARD_RELAY_URL = '/rover/stream';
const HLS_JS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';

type HlsInstance = {
    attachMedia: (media: HTMLMediaElement) => void;
    destroy: () => void;
    loadSource: (source: string) => void;
    on: (event: string, callback: () => void) => void;
};

type HlsConstructor = {
    new (config?: Record<string, unknown>): HlsInstance;
    Events: {
        MANIFEST_PARSED: string;
    };
    isSupported: () => boolean;
};

declare global {
    interface Window {
        Hls?: HlsConstructor;
    }
}

const resolveStreamSource = (streamUrl?: string | null) => {
    const value = streamUrl?.trim() ?? '';

    if (!value || value === 'relay://dashboard') {
        return {
            kind: 'mjpeg',
            src: DASHBOARD_RELAY_URL,
            playable: Boolean(value),
        } as const;
    }

    const lower = value.toLowerCase();

    if (lower.startsWith('rtsp://') || lower.startsWith('rtmp://')) {
        return {
            kind: 'unsupported',
            src: value,
            playable: false,
        } as const;
    }

    if (
        lower.includes('mjpeg') ||
        lower.includes('mjpg') ||
        lower.includes('video_feed') ||
        lower.includes('action=stream')
    ) {
        return {
            kind: 'mjpeg',
            src: value,
            playable: true,
        } as const;
    }

    if (
        lower.endsWith('.m3u8') ||
        lower.endsWith('.mp4') ||
        lower.endsWith('.webm') ||
        lower.includes('.m3u8?')
    ) {
        return {
            kind: 'video',
            src: value,
            playable: true,
        } as const;
    }

    return {
        kind: 'page',
        src: value,
        playable: true,
    } as const;
};

function useHlsVideo(src: string, enabled: boolean) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const video = videoRef.current;

        if (!enabled || !video) {
            return;
        }

        let hls: HlsInstance | null = null;
        let cancelled = false;

        const play = () => {
            void video.play().catch(() => undefined);
        };

        const attach = () => {
            if (cancelled) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                play();
                return;
            }

            const Hls = window.Hls;
            if (!Hls?.isSupported()) {
                video.src = src;
                play();
                return;
            }

            hls = new Hls({
                liveSyncDurationCount: 1,
                liveMaxLatencyDurationCount: 3,
                lowLatencyMode: true,
                maxLiveSyncPlaybackRate: 1.5,
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, play);
        };

        if (window.Hls) {
            attach();
        } else {
            const existingScript = document.querySelector<HTMLScriptElement>(
                `script[src="${HLS_JS_URL}"]`,
            );
            const script = existingScript ?? document.createElement('script');

            script.src = HLS_JS_URL;
            script.async = true;
            script.addEventListener('load', attach, { once: true });
            script.addEventListener('error', attach, { once: true });

            if (!existingScript) {
                document.head.appendChild(script);
            }
        }

        return () => {
            cancelled = true;
            hls?.destroy();
            video.removeAttribute('src');
            video.load();
        };
    }, [enabled, src]);

    return videoRef;
}

export function CameraFeed({ isOnline, streamUrl }: CameraFeedProps) {
    const stream = resolveStreamSource(streamUrl);
    const hasStream = stream.playable;
    const isHls =
        stream.kind === 'video' && stream.src.toLowerCase().includes('.m3u8');
    const hlsVideoRef = useHlsVideo(stream.src, hasStream && isHls);

    if (!isOnline || !hasStream) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-4">
                <VideoOff className="size-8 text-muted-foreground/30" />
                <div className="flex max-w-xs flex-col items-center gap-2">
                    <p className="text-center text-xs tracking-wide text-muted-foreground/50">
                        {!isOnline
                            ? 'Rover offline'
                            : !hasStream
                              ? streamUrl?.trim()
                                  ? 'Stream URL is not browser-playable'
                                  : 'No stream URL configured'
                              : 'Stream unavailable'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-black">
            {stream.kind === 'video' ? (
                <video
                    key={stream.src}
                    ref={isHls ? hlsVideoRef : undefined}
                    className="h-full w-full object-cover"
                    src={isHls ? undefined : stream.src}
                    autoPlay
                    muted
                    playsInline
                    controls={false}
                />
            ) : stream.kind === 'page' ? (
                <iframe
                    key={stream.src}
                    className="h-full w-full border-0"
                    src={stream.src}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    title="Rover Stream Feed"
                />
            ) : (
                <img
                    key={stream.src}
                    className="h-full w-full object-cover"
                    src={stream.src}
                    alt="Rover Stream Feed"
                />
            )}

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
