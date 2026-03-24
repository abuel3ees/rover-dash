import { Head } from '@inertiajs/react';
import { Activity, Battery, Compass, MapPin, Thermometer } from 'lucide-react';
import { useCallback, useState } from 'react';
import { BatteryGauge } from '@/components/rover/battery-gauge';
import { ConnectionIndicator } from '@/components/rover/connection-indicator';
import { GpsDisplay } from '@/components/rover/gps-display';
import { RoverStatusBadge } from '@/components/rover/rover-status-badge';
import { TelemetryCard } from '@/components/rover/telemetry-card';
import { TemperatureDisplay } from '@/components/rover/temperature-display';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    useRoverChannel,
    type StatusPayload,
    type TelemetryPayload,
} from '@/hooks/use-rover-channel';
import AppLayout from '@/layouts/app-layout';
import type {
    AccelerometerTelemetry,
    BatteryTelemetry,
    BreadcrumbItem,
    GpsTelemetry,
    LatestTelemetry,
    Rover,
    TelemetryData,
    TemperatureTelemetry,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Telemetry', href: '/telemetry' },
];

export default function Telemetry({
    rover,
    latestTelemetry,
    telemetryHistory,
}: {
    rover: Pick<Rover, 'id' | 'name' | 'status' | 'is_online'>;
    latestTelemetry: LatestTelemetry;
    telemetryHistory: TelemetryData[];
}) {
    const [telemetry, setTelemetry] = useState(latestTelemetry);
    const [history, setHistory] = useState(telemetryHistory);
    const [roverStatus, setRoverStatus] = useState({
        status: rover.status,
        is_online: rover.is_online,
    });

    const handleTelemetry = useCallback((data: TelemetryPayload) => {
        setTelemetry((prev) => ({
            ...prev,
            [data.type]: {
                id: data.id,
                type: data.type,
                data: data.data,
                recorded_at: data.recorded_at,
            },
        }));

        setHistory((prev) => [
            {
                id: data.id,
                rover_id: 0,
                type: data.type as TelemetryData['type'],
                data: data.data,
                recorded_at: data.recorded_at,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            ...prev.slice(0, 99),
        ]);
    }, []);

    const handleStatusChange = useCallback((data: StatusPayload) => {
        setRoverStatus({
            status: data.status as Rover['status'],
            is_online: data.is_online,
        });
    }, []);

    useRoverChannel(rover.id, {
        onTelemetry: handleTelemetry,
        onStatusChange: handleStatusChange,
    });

    const battery = telemetry?.battery?.data as BatteryTelemetry | undefined;
    const temperature = telemetry?.temperature?.data as
        | TemperatureTelemetry
        | undefined;
    const gps = telemetry?.gps?.data as GpsTelemetry | undefined;
    const accelerometer = telemetry?.accelerometer?.data as
        | AccelerometerTelemetry
        | undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Telemetry" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold">{rover.name}</h1>
                    <RoverStatusBadge
                        status={roverStatus.status as Rover['status']}
                    />
                    <ConnectionIndicator isOnline={roverStatus.is_online} />
                </div>

                {/* Telemetry Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <TelemetryCard title="Battery" icon={Battery}>
                        <BatteryGauge data={battery} />
                    </TelemetryCard>

                    <TelemetryCard title="Temperature" icon={Thermometer}>
                        <TemperatureDisplay data={temperature} />
                    </TelemetryCard>

                    <TelemetryCard title="GPS" icon={MapPin}>
                        <GpsDisplay data={gps} />
                    </TelemetryCard>

                    <TelemetryCard title="Accelerometer" icon={Compass}>
                        {accelerometer ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            X
                                        </span>
                                        <div className="font-mono font-semibold">
                                            {accelerometer.x.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Y
                                        </span>
                                        <div className="font-mono font-semibold">
                                            {accelerometer.y.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Z
                                        </span>
                                        <div className="font-mono font-semibold">
                                            {accelerometer.z.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-sm">
                                    <span>
                                        Pitch:{' '}
                                        <strong>
                                            {accelerometer.pitch.toFixed(1)}°
                                        </strong>
                                    </span>
                                    <span>
                                        Roll:{' '}
                                        <strong>
                                            {accelerometer.roll.toFixed(1)}°
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Compass className="size-4" />
                                <span className="text-sm">No data</span>
                            </div>
                        )}
                    </TelemetryCard>
                </div>

                {/* Telemetry History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Readings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No telemetry data received yet
                            </p>
                        ) : (
                            <div className="max-h-96 space-y-1 overflow-y-auto">
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {item.type}
                                            </Badge>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {JSON.stringify(item.data).slice(
                                                    0,
                                                    80,
                                                )}
                                                {JSON.stringify(item.data)
                                                    .length > 80
                                                    ? '...'
                                                    : ''}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(
                                                item.recorded_at,
                                            ).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
