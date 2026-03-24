import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Battery,
    Camera,
    ChevronRight,
    Circle,
    Cpu,
    Gamepad2,
    Globe,
    MapPin,
    MessageCircle,
    Navigation,
    Octagon,
    Radio,
    Send,
    Settings,
    Thermometer,
    Wifi,
    WifiOff,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActivityFeed } from '@/components/rover/activity-feed';
import { Compass } from '@/components/rover/compass';
import { OrientationDisplay } from '@/components/rover/orientation-display';
import { RadialGauge } from '@/components/rover/radial-gauge';
import { SignalStrength } from '@/components/rover/signal-strength';
import { Sparkline } from '@/components/rover/sparkline';
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

    const [signalLevel, setSignalLevel] = useState(0);

    useEffect(() => {
        function compute() {
            if (!currentRover?.is_online) {
                return 0;
            }

            if (!currentRover?.last_seen_at) {
                return 1;
            }

            const elapsed = (Date.now() - new Date(currentRover.last_seen_at).getTime()) / 1000;

            if (elapsed < 10) {
                return 4;
            }

            if (elapsed < 20) {
                return 3;
            }

            return 2;
        }

        const update = () => setSignalLevel(compute());
        update();
        const id = setInterval(update, 5000);

        return () => clearInterval(id);
    }, [currentRover?.is_online, currentRover?.last_seen_at]);

    if (!currentRover) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center px-6 py-24">
                    <div className="mx-auto max-w-lg text-center">
                        <div className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-card">
                            <Radio className="size-7 text-muted-foreground/60" />
                        </div>
                        <h1 className="font-serif text-4xl tracking-tight text-foreground">
                            No rover connected
                        </h1>
                        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                            Connect a Raspberry Pi rover to unlock live telemetry,
                            camera streaming, and full directional control from your browser.
                        </p>
                        <div className="mt-8">
                            <Button asChild size="lg" className="h-11 rounded-lg px-6 text-sm tracking-wide">
                                <Link href="/rover/setup">
                                    Set up your rover
                                    <ArrowUpRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-3">
                            {[
                                {
                                    icon: <Gamepad2 className="size-5 text-foreground/50" />,
                                    title: 'Control',
                                    desc: 'D-pad, WASD, speed curves',
                                },
                                {
                                    icon: <Camera className="size-5 text-foreground/50" />,
                                    title: 'Camera',
                                    desc: 'Live MJPEG streaming',
                                },
                                {
                                    icon: <Activity className="size-5 text-foreground/50" />,
                                    title: 'Telemetry',
                                    desc: 'GPS, battery, thermals',
                                },
                            ].map((f) => (
                                <div key={f.title} className="flex flex-col items-center gap-2.5 bg-card px-6 py-6">
                                    {f.icon}
                                    <div className="text-center">
                                        <div className="text-sm font-medium tracking-wide">{f.title}</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const battery = telemetry?.battery?.data as BatteryTelemetry | undefined;
    const temperature = telemetry?.temperature?.data as TemperatureTelemetry | undefined;
    const gps = telemetry?.gps?.data as GpsTelemetry | undefined;
    const accel = telemetry?.accelerometer?.data as AccelerometerTelemetry | undefined;

    function sendQuickCommand(type: string, payload: Record<string, unknown> = {}) {
        router.post('/control/command', { type, payload }, { preserveScroll: true });
    }

    const isOnline = currentRover.is_online;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-0 overflow-x-auto">

                {/* ═══ Hero Status Strip ═══════════════════════════════════ */}
                <div className="border-b border-border/50 bg-card/50">
                    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={`flex size-11 items-center justify-center rounded-xl border transition-colors ${
                                    isOnline
                                        ? 'border-emerald-500/30 bg-emerald-500/8'
                                        : 'border-border/60 bg-muted/50'
                                }`}>
                                    {isOnline ? (
                                        <Wifi className="size-5 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <WifiOff className="size-5 text-muted-foreground/60" />
                                    )}
                                </div>
                                {isOnline && (
                                    <span className="absolute -top-0.5 -right-0.5 flex size-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                                        <span className="relative inline-flex size-3 rounded-full bg-emerald-500 ring-2 ring-card/50" />
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="font-serif text-xl tracking-tight">{currentRover.name}</h1>
                                    <Badge
                                        variant={isOnline ? 'default' : 'secondary'}
                                        className={`text-[10px] uppercase tracking-widest font-medium ${
                                            isOnline ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
                                        }`}
                                    >
                                        {currentRover.status}
                                    </Badge>
                                </div>
                                {currentRover.description && (
                                    <p className="mt-0.5 text-xs text-muted-foreground/70 tracking-wide">{currentRover.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Circle className="size-2.5 fill-current opacity-30" />
                                <UptimeCounter since={currentRover.last_seen_at} isOnline={isOnline} />
                            </div>
                            <SignalStrength level={signalLevel} />
                            {currentRover.ip_address && (
                                <span className="font-mono text-muted-foreground/60">{currentRover.ip_address}</span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-xs tracking-wide" asChild>
                                <Link href="/rover/settings">
                                    <Settings className="mr-1.5 size-3.5" />
                                    Settings
                                </Link>
                            </Button>
                            <Button size="sm" className="h-8 text-xs tracking-wide" asChild>
                                <Link href="/control">
                                    <Gamepad2 className="mr-1.5 size-3.5" />
                                    Control
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ═══ Metrics Row ═════════════════════════════════════════ */}
                <div className="grid grid-cols-2 gap-px border-b border-border/50 bg-border/30 lg:grid-cols-4">
                    {[
                        {
                            label: 'Battery',
                            value: battery ? `${battery.percentage}` : '--',
                            unit: battery ? '%' : '',
                            sub: battery?.charging ? 'Charging' : battery ? `${battery.voltage}V` : 'No data',
                            color: 'text-emerald-600 dark:text-emerald-400',
                            icon: <Battery className="size-4" />,
                            trend: batteryHistory,
                            trendColor: 'rgb(16, 185, 129)',
                        },
                        {
                            label: 'CPU Temperature',
                            value: temperature ? `${temperature.cpu_temp}` : '--',
                            unit: temperature ? '°C' : '',
                            sub: temperature ? `Ambient ${temperature.ambient_temp}°C` : 'No data',
                            color: 'text-amber-600 dark:text-amber-400',
                            icon: <Thermometer className="size-4" />,
                            trend: tempHistory,
                            trendColor: 'rgb(245, 158, 11)',
                        },
                        {
                            label: 'GPS Position',
                            value: gps ? `${gps.latitude.toFixed(4)}°` : '--',
                            unit: '',
                            sub: gps ? `${gps.longitude.toFixed(4)}° · ${gps.satellites} sats` : 'No fix',
                            color: 'text-sky-600 dark:text-sky-400',
                            icon: <MapPin className="size-4" />,
                            trend: undefined,
                            trendColor: '',
                        },
                        {
                            label: 'Orientation',
                            value: accel?.pitch !== undefined && accel?.pitch !== null ? `${accel.pitch.toFixed(1)}°` : '--',
                            unit: '',
                            sub: accel?.roll !== undefined && accel?.roll !== null ? `Roll ${accel.roll.toFixed(1)}°` : 'No data',
                            color: 'text-violet-600 dark:text-violet-400',
                            icon: <Navigation className="size-4" />,
                            trend: undefined,
                            trendColor: '',
                        },
                    ].map((metric) => (
                        <div key={metric.label} className="flex items-start justify-between bg-card/80 px-6 py-5">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-muted-foreground/60">
                                    {metric.icon}
                                    <span className="text-[11px] font-medium uppercase tracking-[0.1em]">{metric.label}</span>
                                </div>
                                <div className="mt-2 flex items-baseline gap-0.5">
                                    <span className={`font-serif text-3xl tabular-nums tracking-tight ${metric.color}`}>
                                        {metric.value}
                                    </span>
                                    {metric.unit && (
                                        <span className="text-sm text-muted-foreground/50">{metric.unit}</span>
                                    )}
                                </div>
                                <div className="mt-1 text-[11px] text-muted-foreground/50 tracking-wide">{metric.sub}</div>
                            </div>
                            {metric.trend && metric.trend.length >= 2 && (
                                <div className="mt-6 opacity-60">
                                    <Sparkline
                                        data={metric.trend}
                                        width={72}
                                        height={28}
                                        color={metric.trendColor}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* ═══ Main Grid ═══════════════════════════════════════════ */}
                <div className="flex-1 p-6">
                    <div className="grid gap-6 lg:grid-cols-12">

                        {/* ─── Instruments ────────────────────────────── */}
                        <div className="lg:col-span-5">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">Instruments</span>
                                <div className="h-px flex-1 bg-border/40" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card/60 px-4 py-5">
                                    <RadialGauge
                                        value={battery?.percentage ?? 0}
                                        max={100}
                                        label="Battery"
                                        unit="%"
                                        color="rgb(16, 185, 129)"
                                        dangerThreshold={20}
                                        warningThreshold={50}
                                        sublabel={
                                            battery
                                                ? `${battery.voltage}V${battery.charging ? ' · Charging' : ''}`
                                                : 'No data'
                                        }
                                    />
                                    {batteryHistory.length >= 2 && (
                                        <div className="mt-3 opacity-50">
                                            <Sparkline data={batteryHistory} width={100} height={20} color="rgb(16, 185, 129)" min={0} max={100} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card/60 px-4 py-5">
                                    <RadialGauge
                                        value={temperature?.cpu_temp ?? 0}
                                        max={100}
                                        label="CPU Temp"
                                        unit="°C"
                                        color="rgb(245, 158, 11)"
                                        warningThreshold={65}
                                        dangerThreshold={80}
                                        sublabel={
                                            temperature
                                                ? `Ambient: ${temperature.ambient_temp}°C`
                                                : 'No data'
                                        }
                                    />
                                    {tempHistory.length >= 2 && (
                                        <div className="mt-3 opacity-50">
                                            <Sparkline data={tempHistory} width={100} height={20} color="rgb(245, 158, 11)" min={0} max={100} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-center rounded-xl border border-border/40 bg-card/60 px-4 py-5">
                                    <Compass heading={gps?.heading ?? 0} speed={gps?.speed} />
                                </div>
                                <div className="flex items-center justify-center rounded-xl border border-border/40 bg-card/60 px-4 py-5">
                                    <OrientationDisplay pitch={accel?.pitch ?? 0} roll={accel?.roll ?? 0} />
                                </div>
                            </div>
                        </div>

                        {/* ─── Camera + Activity ──────────────────────── */}
                        <div className="lg:col-span-4">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">Camera</span>
                                <div className="h-px flex-1 bg-border/40" />
                            </div>
                            <div className="overflow-hidden rounded-xl border border-border/40 bg-card/60">
                                <div className="relative aspect-video bg-muted/30">
                                    {isOnline && currentRover.stream_url ? (
                                        <>
                                            <img
                                                src="/rover/stream"
                                                alt="Rover camera"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-sm">
                                                <span className="relative flex size-1.5">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                                                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                                                </span>
                                                Live
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-3">
                                            <Camera className="size-8 text-muted-foreground/20" />
                                            <span className="text-[11px] text-muted-foreground/40 tracking-wide">
                                                {isOnline ? 'No stream configured' : 'Rover offline'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    href="/control"
                                    className="flex items-center justify-between border-t border-border/30 px-4 py-3 text-xs text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
                                >
                                    <span className="tracking-wide">Open Control Center</span>
                                    <ChevronRight className="size-3.5" />
                                </Link>
                            </div>

                            <div className="mt-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">Activity</span>
                                    <div className="h-px flex-1 bg-border/40" />
                                </div>
                                <div className="max-h-[280px] overflow-y-auto rounded-xl border border-border/40 bg-card/60 p-4">
                                    <ActivityFeed commands={commands} telemetry={recentTelemetry ?? []} />
                                </div>
                            </div>
                        </div>

                        {/* ─── Right Column ───────────────────────────── */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Quick Commands */}
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">Commands</span>
                                    <div className="h-px flex-1 bg-border/40" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => sendQuickCommand('stop')}
                                        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/8 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/15 dark:text-red-400"
                                    >
                                        <Octagon className="size-3.5" />
                                        E-Stop
                                    </button>
                                    <button
                                        onClick={() => sendQuickCommand('move', { direction: 'forward', speed: 50 })}
                                        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/60 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent/50"
                                    >
                                        <Send className="size-3.5" />
                                        Forward
                                    </button>
                                    <button
                                        onClick={() => sendQuickCommand('speed', { speed: 25 })}
                                        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/60 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent/50"
                                    >
                                        <Zap className="size-3.5" />
                                        Slow
                                    </button>
                                    <button
                                        onClick={() => sendQuickCommand('speed', { speed: 75 })}
                                        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/60 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent/50"
                                    >
                                        <Zap className="size-3.5" />
                                        Fast
                                    </button>
                                </div>
                            </div>

                            {/* Command Stats */}
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">Statistics</span>
                                    <div className="h-px flex-1 bg-border/40" />
                                </div>
                                {stats && stats.totalCommands > 0 ? (
                                    <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                                        <div className="mb-3">
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">Success rate</span>
                                                <span className="font-serif text-2xl tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">{stats.executedRate}%</span>
                                            </div>
                                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/60">
                                                <div
                                                    className="h-full rounded-full bg-emerald-500/70 transition-all duration-500"
                                                    style={{ width: `${stats.executedRate}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border/30">
                                            {(
                                                [
                                                    ['executed', 'Executed', 'text-emerald-600 dark:text-emerald-400'],
                                                    ['failed', 'Failed', 'text-red-500/80'],
                                                    ['pending', 'Pending', 'text-amber-500/80'],
                                                    ['expired', 'Expired', 'text-muted-foreground/40'],
                                                ] as const
                                            ).map(([key, label, color]) => (
                                                <div key={key} className="flex flex-col items-center bg-card/80 py-3">
                                                    <span className={`font-serif text-xl tabular-nums ${color}`}>
                                                        {stats.commandStats[key] ?? 0}
                                                    </span>
                                                    <span className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground/40">
                                                        {label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 text-center text-[11px] font-mono text-muted-foreground/40">
                                            {stats.totalCommands.toLocaleString()} total commands
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card/60 py-8">
                                        <Send className="size-5 text-muted-foreground/20" />
                                        <span className="text-[11px] text-muted-foreground/40 tracking-wide">No commands sent yet</span>
                                    </div>
                                )}
                            </div>

                            {/* System Info */}
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">System</span>
                                    <div className="h-px flex-1 bg-border/40" />
                                </div>
                                <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                                    <div className="space-y-3">
                                        {[
                                            { icon: <Globe className="size-3.5" />, label: 'IP Address', value: currentRover.ip_address ?? 'Unknown' },
                                            { icon: <Cpu className="size-3.5" />, label: 'Stream Port', value: String(currentRover.stream_port ?? '--') },
                                            { icon: <Activity className="size-3.5" />, label: 'Telemetry', value: (stats?.totalTelemetry ?? 0).toLocaleString() },
                                            {
                                                icon: <Circle className="size-3.5" />,
                                                label: 'Last Seen',
                                                value: currentRover.last_seen_at
                                                    ? new Date(currentRover.last_seen_at).toLocaleTimeString()
                                                    : 'Never',
                                            },
                                        ].map((row) => (
                                            <div key={row.label} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 text-muted-foreground/50">
                                                    {row.icon}
                                                    <span className="tracking-wide">{row.label}</span>
                                                </div>
                                                <span className="font-mono text-foreground/70">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ Navigation Links ════════════════════════════════ */}
                    <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/40 bg-border/30 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                href: '/control',
                                icon: <Gamepad2 className="size-5" />,
                                title: 'Control Center',
                                desc: 'Drive the rover and view camera',
                            },
                            {
                                href: '/telemetry',
                                icon: <Activity className="size-5" />,
                                title: 'Telemetry',
                                desc: 'Detailed sensor history and charts',
                            },
                            {
                                href: '/messaging',
                                icon: <MessageCircle className="size-5" />,
                                title: 'Messaging',
                                desc: 'Coordinate with your team',
                            },
                            {
                                href: '/rover/settings',
                                icon: <Settings className="size-5" />,
                                title: 'Rover Settings',
                                desc: 'Configuration and API tokens',
                            },
                        ].map((card) => (
                            <Link
                                key={card.href}
                                href={card.href}
                                className="group flex items-center gap-4 bg-card/80 px-5 py-4 transition-colors hover:bg-accent/40"
                            >
                                <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40 text-foreground/40 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                    {card.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium tracking-wide">{card.title}</div>
                                    <div className="mt-0.5 text-[11px] text-muted-foreground/50 tracking-wide">{card.desc}</div>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/60" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
