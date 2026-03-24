import { Wifi, WifiOff, AlertTriangle, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RoverStatus } from '@/types';

const statusConfig: Record<
    RoverStatus,
    { label: string; className: string; icon: typeof Wifi }
> = {
    online: { label: 'Online', className: 'bg-green-600', icon: Wifi },
    offline: { label: 'Offline', className: '', icon: WifiOff },
    error: { label: 'Error', className: 'bg-red-600', icon: AlertTriangle },
    maintenance: {
        label: 'Maintenance',
        className: 'bg-yellow-600',
        icon: Wrench,
    },
};

export function RoverStatusBadge({ status }: { status: RoverStatus }) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge
            variant={status === 'offline' ? 'secondary' : 'default'}
            className={config.className}
        >
            <Icon className="size-3" />
            {config.label}
        </Badge>
    );
}
