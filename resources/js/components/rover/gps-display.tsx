import { Compass, MapPin, Navigation } from 'lucide-react';
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
                <span className="text-sm">No GPS data</span>
            </div>
        );
    }

    if (!hasFix) {
        return (
            <div className="space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span className="text-sm">No GPS fix</span>
                </div>
                {data.reason && (
                    <p className="text-xs">
                        {data.source ? `${data.source}: ` : ''}
                        {data.reason}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span className="font-mono text-sm">
                    {data.latitude?.toFixed(6) ?? '--'},{' '}
                    {data.longitude?.toFixed(6) ?? '--'}
                </span>
                {data.stale && (
                    <span className="text-xs text-muted-foreground">stale</span>
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
                <div className="text-muted-foreground">
                    {data.satellites ?? '--'} sat
                </div>
            </div>
        </div>
    );
}
