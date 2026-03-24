import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkline } from '@/components/rover/sparkline';

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string;
    sublabel?: string;
    trend?: number[];
    trendColor?: string;
    iconBg?: string;
}

export function StatCard({
    icon,
    label,
    value,
    sublabel,
    trend,
    trendColor = 'oklch(0.55 0.15 240)',
    iconBg = 'bg-primary/10',
}: StatCardProps) {
    return (
        <Card>
            <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <div
                                className={`flex size-8 items-center justify-center rounded-lg ${iconBg}`}
                            >
                                {icon}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {label}
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
                            {value}
                        </div>
                        {sublabel && (
                            <div className="mt-0.5 text-xs text-muted-foreground">
                                {sublabel}
                            </div>
                        )}
                    </div>
                    {trend && trend.length >= 2 && (
                        <div className="mt-1">
                            <Sparkline
                                data={trend}
                                width={80}
                                height={28}
                                color={trendColor}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
