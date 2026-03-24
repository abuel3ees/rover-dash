import { useEffect, useState } from 'react';

interface UptimeCounterProps {
    since: string | null; // ISO date string of when the rover came online
    isOnline: boolean;
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function UptimeCounter({ since, isOnline }: UptimeCounterProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!since || !isOnline) {
            setElapsed(0);
            return;
        }

        const start = new Date(since).getTime();

        function tick() {
            setElapsed(Math.floor((Date.now() - start) / 1000));
        }

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [since, isOnline]);

    if (!isOnline || !since) {
        return (
            <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-muted-foreground/30" />
                <span className="font-mono text-sm text-muted-foreground">
                    --:--
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <span className="font-mono text-sm tabular-nums">
                {formatDuration(elapsed)}
            </span>
        </div>
    );
}
