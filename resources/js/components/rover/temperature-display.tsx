import { Thermometer } from 'lucide-react';
import type { TemperatureTelemetry } from '@/types';

export function TemperatureDisplay({
    data,
}: {
    data: TemperatureTelemetry | undefined;
}) {
    if (!data) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="size-4" />
                <span className="text-sm">No data</span>
            </div>
        );
    }

    const cpuWarning = data.cpu_temp > 70;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Thermometer
                    className={`size-4 ${cpuWarning ? 'text-red-500' : ''}`}
                />
                <span className="text-sm text-muted-foreground">CPU</span>
                <span
                    className={`text-2xl font-bold ${cpuWarning ? 'text-red-500' : ''}`}
                >
                    {data.cpu_temp}°C
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Thermometer className="size-4" />
                <span className="text-sm text-muted-foreground">Ambient</span>
                <span className="text-lg font-semibold">
                    {data.ambient_temp}°C
                </span>
            </div>
        </div>
    );
}
