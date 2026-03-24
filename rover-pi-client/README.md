# Rover Pi Client

Remote-controlled Raspberry Pi rover client that connects to the Rover Dashboard server.

## Features

- **Real-time Control** — WebSocket-based command and response system
- **Live Telemetry** — Battery, temperature, accelerometer, GPS data
- **Camera Support** — MJPEG streaming with pan/tilt servo control
- **Motor Control** — PWM-based speed and direction control
- **Auto-reconnection** — Automatic reconnection with exponential backoff
- **Systemd Integration** — Run as a service on boot

## Hardware Requirements

- Raspberry Pi 4 or 5 (recommended)
- 2x DC motors with encoder feedback (optional)
- Motor driver (L298N or similar)
- MPU6050 accelerometer/gyroscope (I2C)
- ADS1115 ADC for battery monitoring (optional)
- Pi Camera or USB camera (optional)
- 2x servo motors for camera pan/tilt (optional)
- 12V power supply

## GPIO Pin Layout

### Motors (BCM numbering)

```
Left Motor:
  - Forward:  GPIO 17
  - Backward: GPIO 27
  - PWM:      GPIO 12

Right Motor:
  - Forward:  GPIO 23
  - Backward: GPIO 24
  - PWM:      GPIO 25
```

### Servos (Camera)

```
  - Pan:  GPIO 18
  - Tilt: GPIO 19
```

## Installation

### 1. Clone Repository

```bash
mkdir -p ~/rover
cd ~/rover
git clone https://github.com/yourusername/rover-pi-client.git
cd rover-pi-client
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure

Create `.env` file with your settings:

```bash
cp config.py .env  # Or edit manually
```

Edit the configuration:

```bash
nano .env
```

Required settings:

```env
API_URL=http://192.168.1.100:8000/api
API_TOKEN=your-token-from-dashboard
ROVER_NAME=rover-01
DEBUG=false
```

### 5. Test Run

```bash
python3 main.py
```

Expected output:

```
============================================================
Rover Pi Client - rover-01
Server: http://192.168.1.100:8000/api
============================================================
[INFO] Initializing motor controller...
[INFO] ✓ Motor controller initialized
[INFO] Connecting to server: ws://192.168.1.100:8000
[INFO] ✓ Connected to server
[INFO] ✓ Telemetry thread started
[INFO] ✓ Rover client ready and waiting for commands
```

## Running as a Service

### 1. Install Service File

```bash
sudo cp rover.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### 2. Enable and Start

```bash
sudo systemctl enable rover
sudo systemctl start rover
```

### 3. Check Status

```bash
sudo systemctl status rover
journalctl -u rover -f
```

### Common Commands

```bash
# Start
sudo systemctl start rover

# Stop
sudo systemctl stop rover

# Restart
sudo systemctl restart rover

# View logs
journalctl -u rover -f -n 50

# Disable from auto-start
sudo systemctl disable rover
```

## Configuration

### Motor Pins

Edit `config.py` to match your wiring:

```python
MOTOR_PINS = {
    'left_forward': 17,
    'left_backward': 27,
    'left_pwm': 12,
    'right_forward': 23,
    'right_backward': 24,
    'right_pwm': 25,
}
```

### Telemetry Sensors

Enable/disable sensors in `config.py`:

```python
TELEMETRY_SENSORS = {
    'battery': True,
    'temperature': True,
    'accelerometer': True,
    'gps': False,  # Set to True if you have GPS
}
```

### Camera

Enable camera streaming:

```python
CAMERA_ENABLED = True
CAMERA_RESOLUTION = (640, 480)
CAMERA_FPS = 30
```

## API Reference

### Commands Received

```json
{
  "type": "move",
  "payload": {
    "direction": "forward",
    "speed": 50
  }
}
```

**Movement Types:**

- `move` — Forward, backward, left, right
  - `direction`: forward | backward | left | right
  - `speed`: 0-100

- `rotate` — Rotate in place
  - `direction`: left | right
  - `speed`: 0-100

- `stop` — Emergency stop

- `speed` — Adjust current speed
  - `speed`: 0-100

- `camera` — Camera control
  - `action`: pan_left | pan_right | tilt_up | tilt_down

### Telemetry Sent

```json
{
  "type": "battery",
  "data": {
    "voltage": 11.8,
    "percentage": 75,
    "charging": false
  },
  "recorded_at": "2024-03-25T10:30:45.123Z"
}
```

**Sensor Types:**

- `battery` — Voltage and percentage
- `temperature` — CPU and ambient temperature
- `accelerometer` — Pitch, roll, acceleration data
- `gps` — Latitude, longitude, heading, speed

## Troubleshooting

### Connection Issues

```bash
# Check if server is running
ping 192.168.1.100

# Check network
ifconfig

# Increase debug logging
DEBUG=true python3 main.py
```

### GPIO Permission Errors

```bash
# Add pi user to gpio group
sudo usermod -aG gpio pi

# Logout and login for changes to take effect
```

### Motor Not Moving

1. Check wiring matches `MOTOR_PINS` in config
2. Test GPIO manually:
   ```bash
   python3 -c "import RPi.GPIO as GPIO; GPIO.setmode(GPIO.BCM); GPIO.setup(17, GPIO.OUT); GPIO.output(17, GPIO.HIGH)"
   ```
3. Check motor power supply
4. Verify motor driver connections

### Temperature Not Reading

```bash
# Check thermal zone
cat /sys/class/thermal/thermal_zone0/temp

# Or use vcgencmd
vcgencmd measure_temp
```

### Sensor Not Detected

```bash
# Scan I2C bus
i2cdetect -y 1

# Should show devices at:
# - 0x68: MPU6050
# - 0x48: ADS1115
```

## Development

### Project Structure

```
rover-pi-client/
├── main.py              # Entry point
├── config.py            # Configuration
├── telemetry.py         # Sensor collection
├── motors.py            # Motor control
├── camera.py            # Camera streaming
├── requirements.txt     # Python dependencies
├── rover.service        # Systemd service
└── README.md            # This file
```

### Logging

Logs are written to:

- Console (when running directly)
- Systemd journal (when running as service)

View logs:

```bash
journalctl -u rover -f
```

## Support

For issues and questions:

1. Check logs: `journalctl -u rover -f`
2. Test manually: `python3 main.py` with `DEBUG=true`
3. Verify wiring and GPIO pins
4. Check server connectivity

## License

MIT License - See LICENSE file for details
