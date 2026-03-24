import { Head, Link } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import {
    Activity,
    ArrowRight,
    Battery,
    Camera,
    Clock,
    Gamepad2,
    MapPin,
    MessageCircle,
    Settings,
    Thermometer,
    Wifi,
    WifiOff,
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
import {
    useRoverChannel,
    type StatusPayload,
    type TelemetryPayload,
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
    AccelerometerTelemetry,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({
    rover,
    latestTelemetry,
    recentCommands,
    stats,
}: {
    rover: Rover | null;
    latestTelemetry: LatestTelemetry | null;
    recentCommands: Command[] | null;
    stats: {
        totalCommands: number;
        totalTelemetry: number;
        uptime: string | null;
    } | null;
}) {
    const [currentRover, setCurrentRover] = useState(rover);
    const [telemetry, setTelemetry] = useState(latestTelemetry);

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

    if (!currentRover) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-8 p-4">
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
                        <Gamepad2 className="size-10 text-primary" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            No Rover Connected
                        </h2>
                        <p className="mt-2 max-w-md text-muted-foreground">
                            Set up your rover to start controlling it from the
                            dashboard. You'll need the Raspberry Pi connected
                            and running.
                        </p>
                    </div>
                    <Button size="lg" asChild>
                        <Link href="/rover/setup">
                            Set Up Rover
                            <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const battery = telemetry?.battery?.data as
        | BatteryTelemetry
        | undefined;
    const temperature = telemetry?.temperature?.data as
        | TemperatureTelemetry
        | undefined;
    const gps = telemetry?.gps?.data as GpsTelemetry | undefined;
    const accelerometer = telemetry?.accelerometer?.data as
        | AccelerometerTelemetry
        | undefined;

    const batteryColor =
        battery && battery.percentage < 20
            ? 'text-red-500'
            : battery && battery.percentage < 50
              ? 'text-yellow-500'
              : 'text-green-500';

    const tempWarning = temperature && temperature.cpu_temp >= 70;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Rover Status Header */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex size-10 items-center justify-center rounded-lg ${currentRover.is_online ? 'bg-green-500/10' : 'bg-muted'}`}
                                >
                                    {currentRover.is_online ? (
                                        <Wifi className="size-5 text-green-500" />
                                    ) : (
                                        <WifiOff className="size-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl">
                                            {currentRover.name}
                                        </CardTitle>
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
                                            {currentRover.is_online
                                                ? 'Online'
                                                : 'Offline'}
                                        </Badge>
                                    </div>
                                    {currentRover.description && (
                                        <CardDescription className="mt-1">
                                            {currentRover.description}
                                        </CardDescription>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <Link href="/rover/settings">
                                        <Settings className="mr-1 size-4" />
                                        Settings
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/control">
                                        <Gamepad2 className="mr-1 size-4" />
                                        Control
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Telemetry Summary */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Battery
                                    className={`size-4 ${battery ? batteryColor : ''}`}
                                />
                                Battery
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${battery ? batteryColor : ''}`}
                            >
                                {battery ? `${battery.percentage}%` : '--'}
                            </div>
                            {battery && (
                                <>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                battery.percentage < 20
                                                    ? 'bg-red-500'
                                                    : battery.percentage < 50
                                                      ? 'bg-yellow-500'
                                                      : 'bg-green-500'
                                            }`}
                                            style={{
                                                width: `${battery.percentage}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {battery.voltage}V
                                        {battery.charging
                                            ? ' · Charging'
                                            : ''}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Thermometer
                                    className={`size-4 ${tempWarning ? 'text-red-500' : ''}`}
                                />
                                Temperature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${tempWarning ? 'text-red-500' : ''}`}
                            >
                                {temperature
                                    ? `${temperature.cpu_temp}°C`
                                    : '--'}
                            </div>
                            {temperature && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Ambient: {temperature.ambient_temp}°C
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <MapPin className="size-4" />
                                GPS
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {gps ? `${gps.satellites} sat` : '--'}
                            </div>
                            {gps && (
                                <>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {gps.latitude.toFixed(6)},{' '}
                                        {gps.longitude.toFixed(6)}
                                    </p>
                                    {gps.speed !== undefined && (
                                        <p className="text-xs text-muted-foreground">
                                            Speed: {gps.speed.toFixed(1)} m/s ·
                                            Heading: {gps.heading}°
                                        </p>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Activity className="size-4" />
                                Accelerometer
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {accelerometer
                                    ? `${accelerometer.pitch.toFixed(1)}°`
                                    : '--'}
                            </div>
                            {accelerometer && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Roll: {accelerometer.roll.toFixed(1)}° ·
                                    X:{accelerometer.x.toFixed(2)} Y:
                                    {accelerometer.y.toFixed(2)} Z:
                                    {accelerometer.z.toFixed(2)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions + Recent Activity */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Quick Actions */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2">
                        <Card className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/50">
                            <Link href="/control" className="block">
                                <CardHeader>
                                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Gamepad2 className="size-5 text-blue-500" />
                                    </div>
                                    <CardTitle className="text-base">
                                        Control Center
                                    </CardTitle>
                                    <CardDescription>
                                        Drive the rover, view camera feed, and
                                        send commands
                                    </CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>

                        <Card className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/50">
                            <Link href="/telemetry" className="block">
                                <CardHeader>
                                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                                        <Activity className="size-5 text-green-500" />
                                    </div>
                                    <CardTitle className="text-base">
                                        Telemetry
                                    </CardTitle>
                                    <CardDescription>
                                        View detailed sensor data and history
                                    </CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>

                        <Card className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/50">
                            <Link href="/rover/stream" className="block">
                                <CardHeader>
                                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                                        <Camera className="size-5 text-purple-500" />
                                    </div>
                                    <CardTitle className="text-base">
                                        Camera Feed
                                    </CardTitle>
                                    <CardDescription>
                                        View the live MJPEG stream from the Pi
                                        camera
                                    </CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>

                        <Card className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/50">
                            <Link href="/chat" className="block">
                                <CardHeader>
                                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                                        <MessageCircle className="size-5 text-cyan-500" />
                                    </div>
                                    <CardTitle className="text-base">
                                        Team Chat
                                    </CardTitle>
                                    <CardDescription>
                                        Coordinate with your team in real-time
                                    </CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>
                    </div>

                    {/* Recent Commands */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="size-4" />
                                Recent Commands
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentCommands && recentCommands.length > 0 ? (
                                <div className="space-y-3">
                                    {recentCommands.slice(0, 8).map((cmd) => (
                                        <div
                                            key={cmd.id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        cmd.status ===
                                                        'executed'
                                                            ? 'default'
                                                            : cmd.status ===
                                                                'failed'
                                                              ? 'destructive'
                                                              : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {cmd.status}
                                                </Badge>
                                                <span className="capitalize">
                                                    {cmd.type}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    cmd.created_at,
                                                ).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No commands sent yet. Head to the Control
                                    Center to start driving!
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Row */}
                {stats && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">
                                    Total Commands
                                </div>
                                <div className="mt-1 text-2xl font-bold">
                                    {stats.totalCommands.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">
                                    Telemetry Records
                                </div>
                                <div className="mt-1 text-2xl font-bold">
                                    {stats.totalTelemetry.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">
                                    Last Seen
                                </div>
                                <div className="mt-1 text-2xl font-bold">
                                    {currentRover.last_seen_at
                                        ? new Date(
                                              currentRover.last_seen_at,
                                          ).toLocaleString()
                                        : 'Never'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
