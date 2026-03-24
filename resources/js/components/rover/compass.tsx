interface CompassProps {
    heading: number;
    speed?: number;
    size?: number;
}

export function Compass({ heading, speed, size = 160 }: CompassProps) {
    const center = size / 2;
    const outerR = size / 2 - 8;
    const innerR = outerR - 20;
    const needleLen = innerR - 8;

    // Cardinal direction labels
    const cardinals = [
        { label: 'N', angle: 0 },
        { label: 'E', angle: 90 },
        { label: 'S', angle: 180 },
        { label: 'W', angle: 270 },
    ];

    // Tick marks every 30 degrees
    const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

    const headingRad = ((heading - 90) * Math.PI) / 180;
    const needleX = center + needleLen * Math.cos(headingRad);
    const needleY = center + needleLen * Math.sin(headingRad);
    const tailLen = 15;
    const tailX = center - tailLen * Math.cos(headingRad);
    const tailY = center - tailLen * Math.sin(headingRad);

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Outer ring */}
                    <circle
                        cx={center}
                        cy={center}
                        r={outerR}
                        fill="none"
                        stroke="currentColor"
                        className="text-border"
                        strokeWidth={1.5}
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={innerR}
                        fill="none"
                        stroke="currentColor"
                        className="text-border/50"
                        strokeWidth={1}
                    />

                    {/* Tick marks */}
                    {ticks.map((angle) => {
                        const rad = ((angle - 90) * Math.PI) / 180;
                        const isCardinal = angle % 90 === 0;
                        const r1 = isCardinal ? innerR - 2 : innerR + 2;
                        const r2 = outerR - 2;
                        return (
                            <line
                                key={angle}
                                x1={center + r1 * Math.cos(rad)}
                                y1={center + r1 * Math.sin(rad)}
                                x2={center + r2 * Math.cos(rad)}
                                y2={center + r2 * Math.sin(rad)}
                                stroke="currentColor"
                                className={isCardinal ? 'text-foreground' : 'text-muted-foreground/50'}
                                strokeWidth={isCardinal ? 2 : 1}
                            />
                        );
                    })}

                    {/* Cardinal labels */}
                    {cardinals.map(({ label, angle }) => {
                        const rad = ((angle - 90) * Math.PI) / 180;
                        const labelR = innerR - 14;
                        return (
                            <text
                                key={label}
                                x={center + labelR * Math.cos(rad)}
                                y={center + labelR * Math.sin(rad)}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className={`text-[11px] font-semibold ${label === 'N' ? 'fill-red-500' : 'fill-current text-muted-foreground'}`}
                            >
                                {label}
                            </text>
                        );
                    })}

                    {/* Needle */}
                    <line
                        x1={tailX}
                        y1={tailY}
                        x2={needleX}
                        y2={needleY}
                        stroke="currentColor"
                        className="text-primary"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        style={{
                            filter: 'drop-shadow(0 0 4px oklch(0.55 0.15 240 / 0.4))',
                            transition: 'all 0.5s ease-out',
                        }}
                    />

                    {/* Needle tip */}
                    <circle
                        cx={needleX}
                        cy={needleY}
                        r={3}
                        className="fill-primary"
                    />

                    {/* Center dot */}
                    <circle
                        cx={center}
                        cy={center}
                        r={4}
                        className="fill-primary"
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={2}
                        className="fill-primary-foreground"
                    />
                </svg>

                {/* Heading readout overlay */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-2 py-0.5 text-xs font-mono backdrop-blur-sm">
                    {heading.toFixed(0)}°
                </div>
            </div>
            <span className="mt-1 text-sm font-medium">Heading</span>
            {speed !== undefined && (
                <span className="text-xs text-muted-foreground">
                    {speed.toFixed(1)} m/s
                </span>
            )}
        </div>
    );
}
