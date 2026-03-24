interface SignalStrengthProps {
    level: number; // 0-4
    label?: string;
}

export function SignalStrength({ level, label }: SignalStrengthProps) {
    const bars = [1, 2, 3, 4];
    const heights = [6, 10, 14, 18];

    return (
        <div className="flex items-end gap-0.5">
            {bars.map((bar, i) => (
                <div
                    key={bar}
                    className={`w-[4px] rounded-sm transition-colors ${
                        i < level
                            ? level <= 1
                                ? 'bg-red-500'
                                : level <= 2
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            : 'bg-muted-foreground/20'
                    }`}
                    style={{ height: heights[i] }}
                />
            ))}
            {label && (
                <span className="ml-1.5 text-xs text-muted-foreground">{label}</span>
            )}
        </div>
    );
}
