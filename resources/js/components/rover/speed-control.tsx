import { Gauge } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';

export function SpeedControl({
    initialSpeed = 50,
    onSpeedChange,
    disabled = false,
}: {
    initialSpeed?: number;
    onSpeedChange: (speed: number) => void;
    disabled?: boolean;
}) {
    const [speed, setSpeed] = useState(initialSpeed);

    function handleChange(value: number) {
        setSpeed(value);
        onSpeedChange(value);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                    <Gauge className="size-4" />
                    Speed
                </Label>
                <span className="text-sm font-medium">{speed}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={speed}
                onChange={(e) => handleChange(Number(e.target.value))}
                disabled={disabled}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
            </div>
        </div>
    );
}
