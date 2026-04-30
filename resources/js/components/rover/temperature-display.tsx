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

    const cpuTemp = data.cpu_temp ?? 0;
    const cpuWarning = cpuTemp > 70;
    const secondaryTemp = data.ambient_temp ?? data.motor_temp ?? null;
    const secondaryLabel =
        data.ambient_temp !== undefined ? 'Ambient' : 'Motor';

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
                    {cpuTemp.toFixed(1)}°C
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Thermometer className="size-4" />
                <span className="text-sm text-muted-foreground">
                    {secondaryLabel}
                </span>
                <span className="text-lg font-semibold">
                    {secondaryTemp !== null ? secondaryTemp.toFixed(1) : '--'}°C
                </span>
            </div>
        </div>
    );
}
