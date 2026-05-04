export type RoverStatus = 'online' | 'offline' | 'error' | 'maintenance';

export type Rover = {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    status: RoverStatus;
    stream_url: string | null;
    ip_address: string | null;
    stream_port: number | null;
    hardware_info: Record<string, unknown> | null;
    last_seen_at: string | null;
    is_online: boolean;
    created_at: string;
    updated_at: string;
};

export type TelemetryType = 'gps' | 'accelerometer' | 'battery' | 'temperature';

export type TelemetryData = {
    id: number;
    rover_id: number;
    type: TelemetryType;
    data: Record<string, unknown>;
    recorded_at: string;
    created_at: string;
    updated_at: string;
};

export type GpsTelemetry = {
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
    satellites: number;
};

export type BatteryTelemetry = {
    voltage: number;
    percentage: number;
    charging: boolean;
};

export type TemperatureTelemetry = {
    cpu_temp: number;
    ambient_temp?: number;
    motor_temp?: number;
};

export type AccelerometerTelemetry = {
    x: number;
    y: number;
    z: number;
    pitch: number;
    roll: number;
};

export type CommandType =
    | 'manual_override'
    | 'auto_follow'
    | 'move'
    | 'rotate'
    | 'stop'
    | 'speed'
    | 'camera'
    | 'custom'
    | 'ping';
export type CommandStatus =
    | 'pending'
    | 'sent'
    | 'executed'
    | 'failed'
    | 'expired';

export type Command = {
    id: number;
    rover_id: number;
    user_id: number;
    type: CommandType;
    payload: Record<string, unknown>;
    status: CommandStatus;
    sent_at: string | null;
    executed_at: string | null;
    response: string | null;
    created_at: string;
    updated_at: string;
};

export type MovePayload = {
    direction: 'forward' | 'backward' | 'left' | 'right';
    speed: number;
};

export type LatestTelemetry = {
    gps: TelemetryData | null;
    accelerometer: TelemetryData | null;
    battery: TelemetryData | null;
    temperature: TelemetryData | null;
};
