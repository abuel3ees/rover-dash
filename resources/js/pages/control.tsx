import { Head, router } from '@inertiajs/react';
import { Battery, MapPin, OctagonX, Thermometer } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { BatteryGauge } from '@/components/rover/battery-gauge';
import { CameraFeed } from '@/components/rover/camera-feed';
import { CommandLog } from '@/components/rover/command-log';
import { ConnectionIndicator } from '@/components/rover/connection-indicator';
import { DirectionalPad } from '@/components/rover/directional-pad';
import { GpsDisplay } from '@/components/rover/gps-display';
import { RoverStatusBadge } from '@/components/rover/rover-status-badge';
import { SpeedControl } from '@/components/rover/speed-control';
import { TelemetryCard } from '@/components/rover/telemetry-card';
import { TemperatureDisplay } from '@/components/rover/temperature-display';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    useRoverChannel,
    type CommandPayload,
    type TelemetryPayload,
    type StatusPayload,
} from '@/hooks/use-rover-channel';
import AppLayout from '@/layouts/app-layout';
import type {
    BatteryTelemetry,
    BreadcrumbItem,
    Command,
    GpsTelemetry,
    LatestTelemetry,
    Rover,
    TemperatureTelemetry,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Control', href: '/control' },
];

export default function Control({
    rover,
    latestTelemetry,
    recentCommands,
}: {
    rover: Rover;
    latestTelemetry: LatestTelemetry;
    recentCommands: Command[];
}) {
    const [telemetry, setTelemetry] = useState(latestTelemetry);
    const [commands, setCommands] = useState(recentCommands);
    const [roverStatus, setRoverStatus] = useState({
        status: rover.status,
        is_online: rover.is_online,
    });
    const speedRef = useRef(50);

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
    }, []);

    const handleStatusChange = useCallback((data: StatusPayload) => {
        setRoverStatus({
            status: data.status as Rover['status'],
            is_online: data.is_online,
        });
    }, []);

    const handleCommandCompleted = useCallback((data: CommandPayload) => {
        setCommands((prev) =>
            prev.map((cmd) =>
                cmd.id === data.id
                    ? {
                          ...cmd,
                          status: data.status,
                          executed_at: data.executed_at ?? null,
                          response: data.response ?? null,
                      }
                    : cmd,
            ),
        );
    }, []);

    const handleCommandSent = useCallback((data: CommandPayload) => {
        setCommands((prev) => [
            {
                id: data.id,
                rover_id: 0,
                user_id: 0,
                type: data.type,
                payload: data.payload ?? {},
                status: data.status,
                sent_at: null,
                executed_at: null,
                response: null,
                created_at: data.created_at ?? new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            ...prev.slice(0, 19),
        ]);
    }, []);

    useRoverChannel(rover.id, {
        onTelemetry: handleTelemetry,
        onStatusChange: handleStatusChange,
        onCommandCompleted: handleCommandCompleted,
        onCommandSent: handleCommandSent,
    });

    function sendCommand(type: string, payload: Record<string, unknown>) {
        router.post('/control/command', { type, payload }, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function handleMove(direction: string) {
        sendCommand('move', { direction, speed: speedRef.current });
    }

    function handleStop() {
        sendCommand('stop', {});
    }

    function handleSpeedChange(speed: number) {
        speedRef.current = speed;
        sendCommand('speed', { speed });
    }

    const battery = telemetry?.battery?.data as BatteryTelemetry | undefined;
    const temperature = telemetry?.temperature?.data as
        | TemperatureTelemetry
        | undefined;
    const gps = telemetry?.gps?.data as GpsTelemetry | undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">{rover.name}</h1>
                        <RoverStatusBadge
                            status={roverStatus.status as Rover['status']}
                        />
                        <ConnectionIndicator
                            isOnline={roverStatus.is_online}
                        />
                    </div>
                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={handleStop}
                    >
                        <OctagonX className="mr-2 size-5" />
                        Emergency Stop
                    </Button>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 lg:grid-cols-5">
                    {/* Left Column - Camera + Command Log */}
                    <div className="space-y-4 lg:col-span-3">
                        <CameraFeed isOnline={roverStatus.is_online} streamUrl={rover.stream_url} />

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Command Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CommandLog commands={commands} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Controls + Telemetry */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* Controls */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Movement Controls
                                </CardTitle>
                                <CardDescription>
                                    Use buttons or keyboard to control the rover
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <DirectionalPad
                                    onMove={handleMove}
                                    onStop={handleStop}
                                    disabled={!roverStatus.is_online}
                                />
                                <SpeedControl
                                    onSpeedChange={handleSpeedChange}
                                    disabled={!roverStatus.is_online}
                                />
                            </CardContent>
                        </Card>

                        {/* Compact Telemetry */}
                        <TelemetryCard title="Battery" icon={Battery}>
                            <BatteryGauge data={battery} />
                        </TelemetryCard>

                        <TelemetryCard title="Temperature" icon={Thermometer}>
                            <TemperatureDisplay data={temperature} />
                        </TelemetryCard>

                        <TelemetryCard title="GPS" icon={MapPin}>
                            <GpsDisplay data={gps} />
                        </TelemetryCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
