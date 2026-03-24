import { useEffect, useRef } from 'react';

interface RadialGaugeProps {
    value: number;
    max: number;
    label: string;
    unit: string;
    size?: number;
    strokeWidth?: number;
    color?: string;
    warningThreshold?: number;
    dangerThreshold?: number;
    sublabel?: string;
}

export function RadialGauge({
    value,
    max,
    label,
    unit,
    size = 160,
    strokeWidth = 10,
    color = 'hsl(var(--primary))',
    warningThreshold,
    dangerThreshold,
    sublabel,
}: RadialGaugeProps) {
    const pathRef = useRef<SVGCircleElement>(null);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(value / max, 1);
    const arcLength = 0.75; // 270 degrees
    const dashArray = circumference * arcLength;
    const dashOffset = dashArray * (1 - percentage);

    // Determine color based on thresholds
    let activeColor = color;
    if (dangerThreshold !== undefined && value >= dangerThreshold) {
        activeColor = 'rgb(239, 68, 68)'; // red-500
    } else if (warningThreshold !== undefined && value >= warningThreshold) {
        activeColor = 'rgb(234, 179, 8)'; // yellow-500
    }

    // For battery-style where low is bad
    if (dangerThreshold !== undefined && dangerThreshold < (warningThreshold ?? max)) {
        activeColor = color;
        if (value <= dangerThreshold) {
            activeColor = 'rgb(239, 68, 68)';
        } else if (warningThreshold !== undefined && value <= warningThreshold) {
            activeColor = 'rgb(234, 179, 8)';
        }
    }

    useEffect(() => {
        if (pathRef.current) {
            pathRef.current.style.transition = 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease';
        }
    }, []);

    const center = size / 2;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="-rotate-[225deg]"
                    viewBox={`0 0 ${size} ${size}`}
                >
                    {/* Background track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-muted/50"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeLinecap="round"
                    />
                    {/* Value arc */}
                    <circle
                        ref={pathRef}
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={activeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="drop-shadow-sm"
                        style={{
                            filter: `drop-shadow(0 0 6px ${activeColor}40)`,
                        }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                        {Math.round(value)}
                    </span>
                    <span className="text-xs text-muted-foreground">{unit}</span>
                </div>
            </div>
            <span className="mt-1 text-sm font-medium">{label}</span>
            {sublabel && (
                <span className="text-xs text-muted-foreground">{sublabel}</span>
            )}
        </div>
    );
}
