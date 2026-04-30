import { Badge } from '@/components/ui/badge';
import type { Command } from '@/types';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    sent: 'bg-blue-500',
    executed: 'bg-green-600',
    failed: 'bg-red-600',
    expired: '',
};

function formatCommandType(type: string): string {
    return type.replace(/_/g, ' ');
}

function getCommandDetail(cmd: Command): string | null {
    const { payload } = cmd;

    if (
        (cmd.type === 'move' || cmd.type === 'rotate') &&
        typeof payload.direction === 'string'
    ) {
        return payload.direction;
    }

    if (cmd.type === 'speed' && typeof payload.speed === 'number') {
        return `${payload.speed}%`;
    }

    return null;
}

export function CommandLog({ commands }: { commands: Command[] }) {
    if (commands.length === 0) {
        return (
            <p className="py-4 text-center text-sm text-muted-foreground">
                No commands sent yet
            </p>
        );
    }

    return (
        <div className="max-h-64 space-y-1 overflow-y-auto">
            {commands.map((cmd) => {
                const detail = getCommandDetail(cmd);

                return (
                    <div
                        key={cmd.id}
                        className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">
                                {formatCommandType(cmd.type)}
                            </span>
                            {detail && (
                                <span className="text-muted-foreground">
                                    {detail}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    cmd.status === 'expired'
                                        ? 'secondary'
                                        : 'default'
                                }
                                className={statusColors[cmd.status] ?? ''}
                            >
                                {cmd.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {new Date(cmd.created_at).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
