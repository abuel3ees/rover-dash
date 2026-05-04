import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Battery,
    Bot,
    Check,
    Gamepad2,
    MapPin,
    Octagon,
    RotateCcw,
    RotateCw,
    Thermometer,
    X,
    Zap,
} from 'lucide-react';
import type { Command, TelemetryData } from '@/types';

type ActivityItem =
    | { kind: 'command'; data: Command }
    | { kind: 'telemetry'; data: TelemetryData };

interface ActivityFeedProps {
    commands: Command[];
    telemetry: TelemetryData[];
}

function getCommandIcon(type: string, payload?: Record<string, unknown>) {
    if (type === 'manual_override')
        return <Gamepad2 className="size-3 text-blue-500" />;
    if (type === 'auto_follow')
        return <Bot className="size-3 text-emerald-500" />;
    if (type === 'stop') return <Octagon className="size-3 text-red-500" />;
    if (type === 'speed') return <Zap className="size-3 text-yellow-500" />;
    if (type === 'rotate') {
        const dir = payload?.direction as string | undefined;
        if (dir === 'clockwise')
            return <RotateCw className="size-3 text-blue-500" />;
        if (dir === 'counterclockwise')
            return <RotateCcw className="size-3 text-blue-500" />;
    }
    if (type === 'move') {
        const dir = payload?.direction as string | undefined;
        if (dir === 'forward')
            return <ArrowUp className="size-3 text-blue-500" />;
        if (dir === 'backward')
            return <ArrowDown className="size-3 text-blue-500" />;
        if (dir === 'left')
            return <ArrowLeft className="size-3 text-blue-500" />;
        if (dir === 'right')
            return <ArrowRight className="size-3 text-blue-500" />;
    }
    return <Zap className="size-3 text-primary" />;
}

function getTelemetryIcon(type: string) {
    if (type === 'battery')
        return <Battery className="size-3 text-green-500" />;
    if (type === 'temperature')
        return <Thermometer className="size-3 text-orange-500" />;
    if (type === 'gps') return <MapPin className="size-3 text-cyan-500" />;
    return <Zap className="size-3 text-purple-500" />;
}

function getStatusIcon(status: string) {
    if (status === 'executed')
        return <Check className="size-3 text-green-500" />;
    if (status === 'failed') return <X className="size-3 text-red-500" />;
    return null;
}

function formatCommandType(type: string): string {
    return type.replace(/_/g, ' ');
}

function getCommandDetail(
    type: string,
    payload?: Record<string, unknown>,
): string | null {
    if (
        (type === 'move' || type === 'rotate') &&
        typeof payload?.direction === 'string'
    ) {
        return payload.direction;
    }

    if (type === 'speed' && typeof payload?.speed === 'number') {
        return `${payload.speed}%`;
    }

    return null;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export function ActivityFeed({ commands, telemetry }: ActivityFeedProps) {
    // Merge and sort by created_at/recorded_at
    const items: ActivityItem[] = [
        ...commands.map((c) => ({ kind: 'command' as const, data: c })),
        ...telemetry.map((t) => ({ kind: 'telemetry' as const, data: t })),
    ].sort((a, b) => {
        const aTime =
            a.kind === 'command' ? a.data.created_at : a.data.recorded_at;
        const bTime =
            b.kind === 'command' ? b.data.created_at : b.data.recorded_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    if (items.length === 0) {
        return (
            <div className="flex h-full items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {items.slice(0, 15).map((item, i) => {
                if (item.kind === 'command') {
                    const cmd = item.data;
                    const payload = cmd.payload as
                        | Record<string, unknown>
                        | undefined;
                    const detail = getCommandDetail(cmd.type, payload);

                    return (
                        <div
                            key={`cmd-${cmd.id}`}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted/50"
                            style={{
                                animationDelay: `${i * 50}ms`,
                            }}
                        >
                            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted">
                                {getCommandIcon(cmd.type, payload)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="font-medium capitalize">
                                    {formatCommandType(cmd.type)}
                                </span>
                                {detail && (
                                    <span className="ml-1 text-muted-foreground">
                                        {detail}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {getStatusIcon(cmd.status)}
                                <span className="text-muted-foreground tabular-nums">
                                    {formatTime(cmd.created_at)}
                                </span>
                            </div>
                        </div>
                    );
                }

                const tel = item.data;
                const telData = tel.data as Record<string, unknown>;
                return (
                    <div
                        key={`tel-${tel.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted/50"
                    >
                        <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted">
                            {getTelemetryIcon(tel.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="font-medium capitalize">
                                {tel.type}
                            </span>
                            <span className="ml-1 text-muted-foreground">
                                {tel.type === 'battery' &&
                                    `${telData.percentage}%`}
                                {tel.type === 'temperature' &&
                                    `${telData.cpu_temp}°C`}
                                {tel.type === 'gps' &&
                                    `${(telData.latitude as number)?.toFixed(4)}, ${(telData.longitude as number)?.toFixed(4)}`}
                                {tel.type === 'accelerometer' &&
                                    `P:${(telData.pitch as number)?.toFixed(1)}°`}
                            </span>
                        </div>
                        <span className="text-muted-foreground tabular-nums">
                            {formatTime(tel.recorded_at)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
