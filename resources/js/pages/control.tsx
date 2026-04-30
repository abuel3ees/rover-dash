import type { FormDataConvertible } from '@inertiajs/core';
import { Head, router } from '@inertiajs/react';
import {
    Battery,
    Bot,
    Gamepad2,
    MapPin,
    OctagonX,
    RotateCcw,
    RotateCw,
    Thermometer,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { BatteryGauge } from '@/components/rover/battery-gauge';
import { CameraFeed } from '@/components/rover/camera-feed';
import { CommandLog } from '@/components/rover/command-log';
import { ConnectionIndicator } from '@/components/rover/connection-indicator';
import { DirectionalPad } from '@/components/rover/directional-pad';
import { GpsDisplay } from '@/components/rover/gps-display';
import { RoverStatusBadge } from '@/components/rover/rover-status-badge';
import { SpeedControl } from '@/components/rover/speed-control';
import { TemperatureDisplay } from '@/components/rover/temperature-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type ControlMode = 'automatic' | 'manual';
type RotationDirection = 'clockwise' | 'counterclockwise';

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
    const latestModeCommand = recentCommands.find((command) =>
        ['manual_override', 'auto_follow', 'stop'].includes(command.type),
    );
    const [controlMode, setControlMode] = useState<ControlMode>(
        latestModeCommand?.type === 'manual_override' ||
            latestModeCommand?.type === 'stop'
            ? 'manual'
            : 'automatic',
    );
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
        if (data.type === 'manual_override' || data.type === 'stop') {
            setControlMode('manual');
        } else if (data.type === 'auto_follow') {
            setControlMode('automatic');
        }

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

    function sendCommand(
        type: string,
        payload: Record<string, FormDataConvertible>,
    ) {
        router.post(
            '/control/command',
            { type, payload },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function handleManualOverride() {
        setControlMode('manual');
        sendCommand('manual_override', {});
    }

    function handleAutomaticMode() {
        setControlMode('automatic');
        sendCommand('auto_follow', {});
    }

    function handleMove(direction: string) {
        sendCommand('move', { direction, speed: speedRef.current });
    }

    function handleRotate(direction: RotationDirection) {
        sendCommand('rotate', { direction, speed: speedRef.current });
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
    const manualControlsEnabled =
        roverStatus.is_online && controlMode === 'manual';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">{rover.name}</h1>
                        <RoverStatusBadge
                            status={roverStatus.status as Rover['status']}
                        />
                        <ConnectionIndicator isOnline={roverStatus.is_online} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex overflow-hidden rounded-md border border-border">
                            <Button
                                variant={
                                    controlMode === 'manual'
                                        ? 'default'
                                        : 'ghost'
                                }
                                className="rounded-none"
                                onClick={handleManualOverride}
                                disabled={!roverStatus.is_online}
                            >
                                <Gamepad2 className="mr-2 size-4" />
                                Manual Override
                            </Button>
                            <Button
                                variant={
                                    controlMode === 'automatic'
                                        ? 'default'
                                        : 'ghost'
                                }
                                className="rounded-none border-l border-border"
                                onClick={handleAutomaticMode}
                                disabled={!roverStatus.is_online}
                            >
                                <Bot className="mr-2 size-4" />
                                Automatic
                            </Button>
                        </div>
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={handleStop}
                            disabled={!roverStatus.is_online}
                        >
                            <OctagonX className="mr-2 size-5" />
                            Emergency Stop
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-5">
                    <div className="space-y-4 lg:col-span-3">
                        <CameraFeed
                            isOnline={roverStatus.is_online}
                            streamUrl={rover.stream_url}
                        />

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

                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Movement Controls
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <DirectionalPad
                                    onMove={handleMove}
                                    onStop={handleStop}
                                    disabled={!manualControlsEnabled}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            handleRotate('counterclockwise')
                                        }
                                        disabled={!manualControlsEnabled}
                                    >
                                        <RotateCcw className="mr-2 size-4" />
                                        Counter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            handleRotate('clockwise')
                                        }
                                        disabled={!manualControlsEnabled}
                                    >
                                        <RotateCw className="mr-2 size-4" />
                                        Clockwise
                                    </Button>
                                </div>
                                <SpeedControl
                                    onSpeedChange={handleSpeedChange}
                                    disabled={!manualControlsEnabled}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Battery className="size-4" />
                                    Battery
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BatteryGauge data={battery} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Thermometer className="size-4" />
                                    Temperature
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TemperatureDisplay data={temperature} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="size-4" />
                                    GPS Tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GpsDisplay data={gps} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
