import { Battery, BatteryCharging } from 'lucide-react';
import type { BatteryTelemetry } from '@/types';

export function BatteryGauge({
    data,
}: {
    data: BatteryTelemetry | undefined;
}) {
    if (!data) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Battery className="size-4" />
                <span className="text-sm">No data</span>
            </div>
        );
    }

    const percentage = Math.min(100, Math.max(0, data.percentage));
    const color =
        percentage > 50
            ? 'bg-green-500'
            : percentage > 20
              ? 'bg-yellow-500'
              : 'bg-red-500';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {data.charging ? (
                        <BatteryCharging className="size-4 text-green-500" />
                    ) : (
                        <Battery className="size-4" />
                    )}
                    <span className="text-2xl font-bold">{percentage}%</span>
                </div>
                <span className="text-sm text-muted-foreground">
                    {data.voltage}V
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
