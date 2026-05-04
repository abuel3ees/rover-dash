import { AlertCircle, Compass, MapPin, Navigation, Satellite } from 'lucide-react';
import type { GpsTelemetry } from '@/types';

export function GpsDisplay({ data }: { data: GpsTelemetry | undefined }) {
    const hasFix =
        data !== undefined &&
        data.fix === true &&
        Number.isFinite(data.latitude) &&
        Number.isFinite(data.longitude) &&
        (data.latitude !== 0 || data.longitude !== 0);

    if (!data) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span className="text-sm">Waiting for GPS telemetry…</span>
            </div>
        );
    }

    if (!hasFix) {
        const source = data.source && data.source !== 'auto' ? data.source : null;
        const reason = data.reason ?? 'No satellite lock';
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-4 shrink-0" />
                    <span className="text-sm font-medium">No GPS fix</span>
                    {source && (
                        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {source}
                        </span>
                    )}
                </div>
                <p className="break-all text-[11px] leading-relaxed text-muted-foreground">
                    {reason}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Satellite className="size-3.5" />
                    <span>{data.satellites ?? 0} satellites visible</span>
                    {data.stale && data.age_seconds !== undefined && (
                        <span className="ml-auto text-[10px]">
                            stale · {Math.round(data.age_seconds)}s ago
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <MapPin className="size-4 text-emerald-500" />
                <span className="font-mono text-sm">
                    {data.latitude?.toFixed(6) ?? '--'},{' '}
                    {data.longitude?.toFixed(6) ?? '--'}
                </span>
                {data.stale && (
                    <span className="ml-auto text-xs text-amber-500">stale</span>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                    <Navigation className="size-3.5 text-muted-foreground" />
                    <span>
                        {data.speed !== undefined && data.speed !== null
                            ? `${data.speed.toFixed(1)} m/s`
                            : '--'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Compass className="size-3.5 text-muted-foreground" />
                    <span>
                        {data.heading !== undefined && data.heading !== null
                            ? `${data.heading.toFixed(0)}°`
                            : '--'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Satellite className="size-3.5" />
                    <span>{data.satellites ?? '--'}</span>
                </div>
            </div>
        </div>
    );
}
