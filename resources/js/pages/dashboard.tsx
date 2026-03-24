import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Battery,
    Gamepad2,
    MapPin,
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
import AppLayout from '@/layouts/app-layout';
import type {
    BreadcrumbItem,
    LatestTelemetry,
    Rover,
    BatteryTelemetry,
    TemperatureTelemetry,
    GpsTelemetry,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    rover,
    latestTelemetry,
}: {
    rover: Rover | null;
    latestTelemetry: LatestTelemetry | null;
}) {
    if (!rover) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 p-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            No Rover Connected
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Set up your rover to start controlling it from the
                            dashboard.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/rover/setup">Set Up Rover</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const battery = latestTelemetry?.battery?.data as
        | BatteryTelemetry
        | undefined;
    const temperature = latestTelemetry?.temperature?.data as
        | TemperatureTelemetry
        | undefined;
    const gps = latestTelemetry?.gps?.data as GpsTelemetry | undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Rover Status Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-xl">
                                    {rover.name}
                                </CardTitle>
                                <Badge
                                    variant={
                                        rover.is_online
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className={
                                        rover.is_online
                                            ? 'bg-green-600'
                                            : ''
                                    }
                                >
                                    {rover.is_online ? (
                                        <Wifi className="size-3" />
                                    ) : (
                                        <WifiOff className="size-3" />
                                    )}
                                    {rover.is_online ? 'Online' : 'Offline'}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
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
                        {rover.description && (
                            <CardDescription>
                                {rover.description}
                            </CardDescription>
                        )}
                    </CardHeader>
                </Card>

                {/* Telemetry Summary */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Battery className="size-4" />
                                Battery
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {battery
                                    ? `${battery.percentage}%`
                                    : '--'}
                            </div>
                            {battery && (
                                <p className="text-xs text-muted-foreground">
                                    {battery.voltage}V
                                    {battery.charging
                                        ? ' - Charging'
                                        : ''}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Thermometer className="size-4" />
                                Temperature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {temperature
                                    ? `${temperature.cpu_temp}°C`
                                    : '--'}
                            </div>
                            {temperature && (
                                <p className="text-xs text-muted-foreground">
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
                                <p className="text-xs text-muted-foreground">
                                    {gps.latitude.toFixed(6)},{' '}
                                    {gps.longitude.toFixed(6)}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Activity className="size-4" />
                                Status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">
                                {rover.status}
                            </div>
                            {rover.last_seen_at && (
                                <p className="text-xs text-muted-foreground">
                                    Last seen:{' '}
                                    {new Date(
                                        rover.last_seen_at,
                                    ).toLocaleString()}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <Link href="/control" className="block">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gamepad2 className="size-5" />
                                    Control Center
                                </CardTitle>
                                <CardDescription>
                                    Drive the rover, view camera feed, and
                                    send commands
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <Link href="/telemetry" className="block">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="size-5" />
                                    Telemetry
                                </CardTitle>
                                <CardDescription>
                                    View detailed sensor data and history
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
