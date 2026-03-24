interface OrientationDisplayProps {
    pitch: number;
    roll: number;
    size?: number;
}

export function OrientationDisplay({ pitch, roll, size = 160 }: OrientationDisplayProps) {
    const center = size / 2;
    const radius = size / 2 - 16;

    // Clamp pitch and roll for visual representation
    const clampedPitch = Math.max(-45, Math.min(45, pitch));
    const clampedRoll = Math.max(-45, Math.min(45, roll));

    // Horizon line offset based on pitch
    const horizonOffset = (clampedPitch / 45) * radius * 0.6;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <defs>
                        <clipPath id="attitude-clip">
                            <circle cx={center} cy={center} r={radius} />
                        </clipPath>
                        <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.65 0.18 240)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="oklch(0.65 0.18 240)" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="ground-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.5 0.1 30)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="oklch(0.5 0.1 30)" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>

                    {/* Outer ring */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius + 4}
                        fill="none"
                        stroke="currentColor"
                        className="text-border"
                        strokeWidth={1.5}
                    />

                    {/* Rotated group for roll */}
                    <g
                        transform={`rotate(${clampedRoll}, ${center}, ${center})`}
                        clipPath="url(#attitude-clip)"
                        style={{ transition: 'transform 0.3s ease-out' }}
                    >
                        {/* Sky half */}
                        <rect
                            x={0}
                            y={0}
                            width={size}
                            height={center + horizonOffset}
                            fill="url(#sky-gradient)"
                        />

                        {/* Ground half */}
                        <rect
                            x={0}
                            y={center + horizonOffset}
                            width={size}
                            height={size - center - horizonOffset}
                            fill="url(#ground-gradient)"
                        />

                        {/* Horizon line */}
                        <line
                            x1={0}
                            y1={center + horizonOffset}
                            x2={size}
                            y2={center + horizonOffset}
                            stroke="currentColor"
                            className="text-foreground/60"
                            strokeWidth={1.5}
                        />

                        {/* Pitch ladder lines */}
                        {[-20, -10, 10, 20].map((deg) => {
                            const offset = (deg / 45) * radius * 0.6;
                            const lineWidth = Math.abs(deg) === 20 ? 20 : 30;
                            return (
                                <g key={deg}>
                                    <line
                                        x1={center - lineWidth}
                                        y1={center + horizonOffset + offset}
                                        x2={center + lineWidth}
                                        y2={center + horizonOffset + offset}
                                        stroke="currentColor"
                                        className="text-muted-foreground/40"
                                        strokeWidth={1}
                                        strokeDasharray={Math.abs(deg) === 10 ? '4,4' : undefined}
                                    />
                                    <text
                                        x={center + lineWidth + 4}
                                        y={center + horizonOffset + offset}
                                        className="fill-muted-foreground/60 text-[8px]"
                                        dominantBaseline="central"
                                    >
                                        {-deg}
                                    </text>
                                </g>
                            );
                        })}
                    </g>

                    {/* Fixed aircraft symbol */}
                    <g className="text-primary">
                        {/* Center dot */}
                        <circle cx={center} cy={center} r={3} fill="currentColor" />
                        {/* Wings */}
                        <line
                            x1={center - 30}
                            y1={center}
                            x2={center - 10}
                            y2={center}
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        />
                        <line
                            x1={center + 10}
                            y1={center}
                            x2={center + 30}
                            y2={center}
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        />
                        {/* Tail */}
                        <line
                            x1={center}
                            y1={center + 5}
                            x2={center}
                            y2={center + 15}
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                    </g>

                    {/* Roll indicator marks on outer ring */}
                    {[-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].map((deg) => {
                        const rad = ((deg - 90) * Math.PI) / 180;
                        const r1 = radius;
                        const r2 = radius + (deg % 30 === 0 ? 6 : 4);
                        return (
                            <line
                                key={deg}
                                x1={center + r1 * Math.cos(rad)}
                                y1={center + r1 * Math.sin(rad)}
                                x2={center + r2 * Math.cos(rad)}
                                y2={center + r2 * Math.sin(rad)}
                                stroke="currentColor"
                                className={deg === 0 ? 'text-primary' : 'text-muted-foreground/50'}
                                strokeWidth={deg === 0 ? 2 : 1}
                            />
                        );
                    })}

                    {/* Roll pointer (rotates with roll) */}
                    <polygon
                        points={`${center},${center - radius + 2} ${center - 4},${center - radius - 5} ${center + 4},${center - radius - 5}`}
                        className="fill-primary"
                        transform={`rotate(${clampedRoll}, ${center}, ${center})`}
                        style={{ transition: 'transform 0.3s ease-out' }}
                    />
                </svg>

                {/* Readouts */}
                <div className="absolute bottom-1 left-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur-sm">
                    P {pitch.toFixed(1)}°
                </div>
                <div className="absolute bottom-1 right-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur-sm">
                    R {roll.toFixed(1)}°
                </div>
            </div>
            <span className="mt-1 text-sm font-medium">Attitude</span>
            <span className="text-xs text-muted-foreground">Pitch & Roll</span>
        </div>
    );
}
