interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    fillOpacity?: number;
    min?: number;
    max?: number;
}

export function Sparkline({
    data,
    width = 120,
    height = 32,
    color = 'oklch(0.55 0.15 240)',
    fillOpacity = 0.15,
    min: forcedMin,
    max: forcedMax,
}: SparklineProps) {
    if (data.length < 2) return null;

    const min = forcedMin ?? Math.min(...data);
    const max = forcedMax ?? Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    const points = data.map((value, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    });

    const linePath = `M ${points.join(' L ')}`;
    const fillPath = `${linePath} L ${width - padding},${height} L ${padding},${height} Z`;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
        >
            {/* Fill area */}
            <path
                d={fillPath}
                fill={color}
                opacity={fillOpacity}
            />
            {/* Line */}
            <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Current value dot */}
            {data.length > 0 && (
                <circle
                    cx={width - padding}
                    cy={
                        height -
                        padding -
                        ((data[data.length - 1] - min) / range) *
                            (height - padding * 2)
                    }
                    r={2.5}
                    fill={color}
                >
                    <animate
                        attributeName="r"
                        values="2.5;3.5;2.5"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
            )}
        </svg>
    );
}
