import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import {
    Activity,
    ArrowRight,
    Battery,
    Camera,
    Clock,
    Gamepad2,
    Globe,
    MapPin,
    MessageCircle,
    Octagon,
    Send,
    Settings,
    Thermometer,
    Wifi,
    WifiOff,
    Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ActivityFeed } from '@/components/rover/activity-feed';
import { Compass } from '@/components/rover/compass';
import { OrientationDisplay } from '@/components/rover/orientation-display';
import { RadialGauge } from '@/components/rover/radial-gauge';
import { SignalStrength } from '@/components/rover/signal-strength';
import { Sparkline } from '@/components/rover/sparkline';
import { StatCard } from '@/components/rover/stat-card';
import { UptimeCounter } from '@/components/rover/uptime-counter';
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
    Command,
    GpsTelemetry,
    LatestTelemetry,
    Rover,
    TelemetryData,
    TemperatureTelemetry,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface DashboardProps {
    rover: Rover | null;
    latestTelemetry: LatestTelemetry | null;
    recentCommands: Command[] | null;
    recentTelemetry: TelemetryData[] | null;
    stats: {
        totalCommands: number;
        totalTelemetry: number;
        uptime: string | null;
        commandStats: Record<string, number>;
        executedRate: number;
    } | null;
    batteryHistory: number[];
    temperatureHistory: number[];
}

export default function Dashboard({
    rover,
    latestTelemetry,
    recentCommands,
    recentTelemetry,
    stats,
    batteryHistory: initialBatteryHistory,
    temperatureHistory: initialTempHistory,
}: DashboardProps) {
    const [currentRover, setCurrentRover] = useState(rover);
    const [telemetry, setTelemetry] = useState(latestTelemetry);
    const [commands, setCommands] = useState(recentCommands ?? []);
    const [batteryHistory, setBatteryHistory] = useState(initialBatteryHistory);
    const [tempHistory, setTempHistory] = useState(initialTempHistory);

    const onTelemetry = useCallback(
        (data: TelemetryPayload) => {
            setTelemetry((prev) => {
                const base = prev ?? {
                    gps: null,
                    accelerometer: null,
                    battery: null,
                    temperature: null,
                };
                return {
                    ...base,
                    [data.type]: {
                        id: data.id,
                        rover_id: currentRover?.id ?? 0,
                        type: data.type,
                        data: data.data,
                        recorded_at: data.recorded_at,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                };
            });
            // Update sparklines
            if (data.type === 'battery') {
                const pct = (data.data as Record<string, unknown>)
                    .percentage as number;
                if (pct !== undefined) {
                    setBatteryHistory((prev) => [...prev.slice(-19), pct]);
                }
            }
            if (data.type === 'temperature') {
                const temp = (data.data as Record<string, unknown>)
                    .cpu_temp as number;
                if (temp !== undefined) {
                    setTempHistory((prev) => [...prev.slice(-19), temp]);
                }
            }
        },
        [currentRover?.id],
    );

    const onStatusChange = useCallback((data: StatusPayload) => {
        setCurrentRover((prev) =>
            prev
                ? {
                      ...prev,
                      status: data.status as Rover['status'],
                      is_online: data.is_online,
                      last_seen_at: data.last_seen_at,
                  }
                : prev,
        );
    }, []);

    useRoverChannel(currentRover?.id, { onTelemetry, onStatusChange });

    // ─── No Rover State ─────────────────────────────────────────────
    if (!currentRover) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-8 p-8">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/10" />
                        <div className="relative flex size-24 items-center justify-center rounded-2xl bg-primary/10">
                            <Gamepad2 className="size-12 text-primary" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">
                            No Rover Connected
                        </h2>
                        <p className="mt-3 max-w-md text-muted-foreground">
                            Set up your Raspberry Pi rover to start controlling
                            it. You'll see live telemetry, camera feed, and
                            full directional control.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button size="lg" asChild>
                            <Link href="/rover/setup">
                                Set Up Rover
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Feature preview cards */}
                    <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-3">
                        {[
                            {
                                icon: (
                                    <Gamepad2 className="size-5 text-blue-500" />
                                ),
                                title: 'Control',
                                desc: 'D-pad with WASD',
                            },
                            {
                                icon: (
                                    <Camera className="size-5 text-purple-500" />
                                ),
                                title: 'Camera',
                                desc: 'Live MJPEG feed',
                            },
                            {
                                icon: (
                                    <Activity className="size-5 text-green-500" />
                                ),
                                title: 'Telemetry',
                                desc: 'Real-time sensors',
                            },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                            >
                                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                    {f.icon}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">
                                        {f.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {f.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    // ─── Extract Telemetry Data ─────────────────────────────────────
    const battery = telemetry?.battery?.data as
        | BatteryTelemetry
        | undefined;
    const temperature = telemetry?.temperature?.data as
        | TemperatureTelemetry
        | undefined;
    const gps = telemetry?.gps?.data as GpsTelemetry | undefined;
    const accel = telemetry?.accelerometer?.data as
        | AccelerometerTelemetry
        | undefined;

    const signalLevel = currentRover.is_online
        ? currentRover.last_seen_at
            ? (Date.now() - new Date(currentRover.last_seen_at).getTime()) / 1000 < 10
                ? 4
                : (Date.now() - new Date(currentRover.last_seen_at).getTime()) / 1000 < 20
                  ? 3
                  : 2
            : 1
        : 0;

    function sendQuickCommand(type: string, payload: Record<string, unknown> = {}) {
        router.post(
            '/control/command',
            { type, payload },
            { preserveScroll: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* ─── Status Bar ─────────────────────────────────────── */}
                <Card>
                    <CardContent className="py-3">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Left: Rover info */}
                            <div className="flex items-center gap-4">
                                <div
                                    className={`flex size-10 items-center justify-center rounded-lg transition-colors ${
                                        currentRover.is_online
                                            ? 'bg-green-500/10'
                                            : 'bg-muted'
                                    }`}
                                >
                                    {currentRover.is_online ? (
                                        <Wifi className="size-5 text-green-500" />
                                    ) : (
                                        <WifiOff className="size-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg font-semibold">
                                            {currentRover.name}
                                        </h1>
                                        <Badge
                                            variant={
                                                currentRover.is_online
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                currentRover.is_online
                                                    ? 'bg-green-600'
                                                    : ''
                                            }
                                        >
                                            {currentRover.status}
                                        </Badge>
                                    </div>
                                    {currentRover.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {currentRover.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Center: Status indicators */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Clock className="size-3.5 text-muted-foreground" />
                                    <UptimeCounter
                                        since={currentRover.last_seen_at}
                                        isOnline={currentRover.is_online}
                                    />
                                </div>
                                <SignalStrength level={signalLevel} />
                                {currentRover.ip_address && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Globe className="size-3.5" />
                                        {currentRover.ip_address}
                                    </div>
                                )}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <Link href="/rover/settings">
                                        <Settings className="mr-1 size-3.5" />
                                        Settings
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/control">
                                        <Gamepad2 className="mr-1 size-3.5" />
                                        Control
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ─── Instruments Row ────────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-4">
                    {/* Battery Gauge */}
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center pt-4 pb-4">
                            <RadialGauge
                                value={battery?.percentage ?? 0}
                                max={100}
                                label="Battery"
                                unit="%"
                                color="rgb(34, 197, 94)"
                                dangerThreshold={20}
                                warningThreshold={50}
                                sublabel={
                                    battery
                                        ? `${battery.voltage}V${battery.charging ? ' · Charging' : ''}`
                                        : 'No data'
                                }
                            />
                            {batteryHistory.length >= 2 && (
                                <div className="mt-2">
                                    <Sparkline
                                        data={batteryHistory}
                                        width={120}
                                        height={24}
                                        color="rgb(34, 197, 94)"
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Temperature Gauge */}
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center pt-4 pb-4">
                            <RadialGauge
                                value={temperature?.cpu_temp ?? 0}
                                max={100}
                                label="CPU Temp"
                                unit="°C"
                                color="rgb(249, 115, 22)"
                                warningThreshold={65}
                                dangerThreshold={80}
                                sublabel={
                                    temperature
                                        ? `Ambient: ${temperature.ambient_temp}°C`
                                        : 'No data'
                                }
                            />
                            {tempHistory.length >= 2 && (
                                <div className="mt-2">
                                    <Sparkline
                                        data={tempHistory}
                                        width={120}
                                        height={24}
                                        color="rgb(249, 115, 22)"
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Compass */}
                    <Card>
                        <CardContent className="flex items-center justify-center pt-4 pb-4">
                            <Compass
                                heading={gps?.heading ?? 0}
                                speed={gps?.speed}
                            />
                        </CardContent>
                    </Card>

                    {/* Orientation */}
                    <Card>
                        <CardContent className="flex items-center justify-center pt-4 pb-4">
                            <OrientationDisplay
                                pitch={accel?.pitch ?? 0}
                                roll={accel?.roll ?? 0}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Stats Row ──────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<Battery className="size-4 text-green-500" />}
                        label="Battery"
                        value={
                            battery
                                ? `${battery.percentage}%`
                                : '--'
                        }
                        sublabel={battery?.charging ? 'Charging' : battery ? 'Discharging' : undefined}
                        trend={batteryHistory}
                        trendColor="rgb(34, 197, 94)"
                        iconBg="bg-green-500/10"
                    />
                    <StatCard
                        icon={
                            <Thermometer className="size-4 text-orange-500" />
                        }
                        label="Temperature"
                        value={
                            temperature
                                ? `${temperature.cpu_temp}°C`
                                : '--'
                        }
                        sublabel={
                            temperature
                                ? `Ambient: ${temperature.ambient_temp}°C`
                                : undefined
                        }
                        trend={tempHistory}
                        trendColor="rgb(249, 115, 22)"
                        iconBg="bg-orange-500/10"
                    />
                    <StatCard
                        icon={<MapPin className="size-4 text-cyan-500" />}
                        label="GPS Position"
                        value={
                            gps
                                ? `${gps.latitude.toFixed(4)}°`
                                : '--'
                        }
                        sublabel={
                            gps
                                ? `${gps.longitude.toFixed(4)}° · ${gps.satellites} satellites`
                                : undefined
                        }
                        iconBg="bg-cyan-500/10"
                    />
                    <StatCard
                        icon={<Activity className="size-4 text-purple-500" />}
                        label="Accelerometer"
                        value={
                            accel?.pitch !== undefined && accel?.pitch !== null
                                ? `${accel.pitch.toFixed(1)}° pitch`
                                : '--'
                        }
                        sublabel={
                            accel?.roll !== undefined && accel?.roll !== null
                                ? `Roll: ${accel.roll.toFixed(1)}°`
                                : undefined
                        }
                        iconBg="bg-purple-500/10"
                    />
                </div>

                {/* ─── Main Content Row ───────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Camera Preview */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Camera className="size-4" />
                                Camera Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                                {currentRover.is_online &&
                                currentRover.stream_url ? (
                                    <>
                                        <img
                                            src="/rover/stream"
                                            alt="Rover camera"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-medium text-white">
                                            <span className="relative flex size-1.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                                                <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                                            </span>
                                            LIVE
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center gap-2">
                                        <Camera className="size-8 text-muted-foreground/40" />
                                        <span className="text-xs text-muted-foreground">
                                            {currentRover.is_online
                                                ? 'No stream configured'
                                                : 'Rover offline'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 w-full"
                                asChild
                            >
                                <Link href="/control">
                                    Open Control Center
                                    <ArrowRight className="ml-1 size-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Activity className="size-4" />
                                Activity Feed
                            </CardTitle>
                            <CardDescription>
                                Commands and telemetry events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[320px] overflow-y-auto">
                                <ActivityFeed
                                    commands={commands}
                                    telemetry={recentTelemetry ?? []}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions + Stats */}
                    <div className="flex flex-col gap-4">
                        {/* Quick Commands */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Zap className="size-4" />
                                    Quick Commands
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-10"
                                        onClick={() =>
                                            sendQuickCommand('stop')
                                        }
                                    >
                                        <Octagon className="mr-1.5 size-4" />
                                        E-Stop
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10"
                                        onClick={() =>
                                            sendQuickCommand('move', {
                                                direction: 'forward',
                                                speed: 50,
                                            })
                                        }
                                    >
                                        <Send className="mr-1.5 size-4" />
                                        Forward
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10"
                                        onClick={() =>
                                            sendQuickCommand('speed', {
                                                speed: 25,
                                            })
                                        }
                                    >
                                        <Zap className="mr-1.5 size-4" />
                                        Slow
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10"
                                        onClick={() =>
                                            sendQuickCommand('speed', {
                                                speed: 75,
                                            })
                                        }
                                    >
                                        <Zap className="mr-1.5 size-4" />
                                        Fast
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Command Stats */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Send className="size-4" />
                                    Command Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats && stats.totalCommands > 0 ? (
                                    <div className="space-y-3">
                                        {/* Success rate bar */}
                                        <div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    Success rate
                                                </span>
                                                <span className="font-medium">
                                                    {stats.executedRate}%
                                                </span>
                                            </div>
                                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-green-500 transition-all"
                                                    style={{
                                                        width: `${stats.executedRate}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Breakdown */}
                                        <div className="grid grid-cols-2 gap-2 text-center">
                                            {(
                                                [
                                                    [
                                                        'executed',
                                                        'Executed',
                                                        'text-green-500',
                                                    ],
                                                    [
                                                        'failed',
                                                        'Failed',
                                                        'text-red-500',
                                                    ],
                                                    [
                                                        'pending',
                                                        'Pending',
                                                        'text-yellow-500',
                                                    ],
                                                    [
                                                        'expired',
                                                        'Expired',
                                                        'text-muted-foreground',
                                                    ],
                                                ] as const
                                            ).map(([key, label, color]) => (
                                                <div
                                                    key={key}
                                                    className="rounded-lg bg-muted/50 p-2"
                                                >
                                                    <div
                                                        className={`text-lg font-bold ${color}`}
                                                    >
                                                        {stats.commandStats[
                                                            key
                                                        ] ?? 0}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="text-center text-xs text-muted-foreground">
                                            {stats.totalCommands.toLocaleString()}{' '}
                                            total commands
                                        </div>
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-xs text-muted-foreground">
                                        No commands sent yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* System Info */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Globe className="size-4" />
                                    System Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            IP Address
                                        </span>
                                        <span className="font-mono">
                                            {currentRover.ip_address ??
                                                'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Stream Port
                                        </span>
                                        <span className="font-mono">
                                            {currentRover.stream_port ?? '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Telemetry Records
                                        </span>
                                        <span className="font-mono">
                                            {(
                                                stats?.totalTelemetry ?? 0
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Last Seen
                                        </span>
                                        <span>
                                            {currentRover.last_seen_at
                                                ? new Date(
                                                      currentRover.last_seen_at,
                                                  ).toLocaleTimeString()
                                                : 'Never'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ─── Navigation Cards ───────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            href: '/control',
                            icon: (
                                <Gamepad2 className="size-5 text-blue-500" />
                            ),
                            bg: 'bg-blue-500/10',
                            title: 'Control Center',
                            desc: 'Drive the rover and view camera',
                        },
                        {
                            href: '/telemetry',
                            icon: (
                                <Activity className="size-5 text-green-500" />
                            ),
                            bg: 'bg-green-500/10',
                            title: 'Telemetry',
                            desc: 'Detailed sensor history',
                        },
                        {
                            href: '/chat',
                            icon: (
                                <MessageCircle className="size-5 text-cyan-500" />
                            ),
                            bg: 'bg-cyan-500/10',
                            title: 'Team Chat',
                            desc: 'Coordinate with your team',
                        },
                        {
                            href: '/rover/settings',
                            icon: (
                                <Settings className="size-5 text-muted-foreground" />
                            ),
                            bg: 'bg-muted',
                            title: 'Rover Settings',
                            desc: 'Configuration & API tokens',
                        },
                    ].map((card) => (
                        <Card
                            key={card.href}
                            className="cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                        >
                            <Link href={card.href} className="block">
                                <CardHeader className="pb-3">
                                    <div
                                        className={`mb-2 flex size-10 items-center justify-center rounded-lg ${card.bg}`}
                                    >
                                        {card.icon}
                                    </div>
                                    <CardTitle className="text-sm">
                                        {card.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {card.desc}
                                    </CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
