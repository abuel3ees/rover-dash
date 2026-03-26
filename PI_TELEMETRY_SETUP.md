# Rover Pi Telemetry Client Setup Guide

## Overview
This script collects telemetry data from your Raspberry Pi and sends it to the Rover Dashboard API.

## Installation

### 1. Copy Script to Pi
```bash
# On your Pi
cd /home/hamzamira/rover/rover-pi-client
wget https://raw.githubusercontent.com/your-repo/rover-dashboard/main/pi-telemetry-client.py
chmod +x pi-telemetry-client.py
```

### 2. Install Dependencies
```bash
pip3 install requests
```

### 3. Get Your Rover API Token
- Log in to the dashboard
- Go to Rover Settings → API Tokens
- Create a new token and copy it

### 4. Configure the Script

#### Option A: Using config.json (Recommended)
The script will create `config.json` on first run:

```bash
python3 pi-telemetry-client.py
```

Edit `config.json`:
```json
{
  "dashboard_url": "https://your-dashboard.com",
  "rover_token": "your-api-token-from-dashboard",
  "rover_id": "your-rover-id"
}
```

#### Option B: Using Environment Variables
```bash
export DASHBOARD_URL="https://your-dashboard.com"
export ROVER_TOKEN="your-api-token"
python3 pi-telemetry-client.py
```

## Data Collected

The script collects and sends:

### 1. **Temperature Data**
- CPU temperature
- Ambient temperature
- Motor temperature (estimated from system load)
- Source: `/sys/class/thermal`, `vcgencmd` (RPi), `/sys/class/hwmon`

### 2. **Battery Data**
- Battery percentage
- Voltage (V)
- Current (A)
- Status
- Source: `/sys/class/power_supply`

### 3. **Accelerometer Data**
- X, Y, Z acceleration
- Pitch and Roll angles
- Source: I2C sensors or simulated fallback

### 4. **GPS Data**
- Latitude, Longitude
- Altitude
- Speed
- Heading
- Number of satellites
- Accuracy
- Source: gpsd daemon (if available)

### 5. **System Info** (sent once during setup)
- CPU model
- RAM amount
- Storage
- OS version

## Running the Script

### Manual Run
```bash
python3 pi-telemetry-client.py
```

### Automated with Crontab
Add to Pi's crontab to run every minute:

```bash
crontab -e
```

Add this line:
```
* * * * * cd /home/hamzamira/rover/rover-pi-client && python3 pi-telemetry-client.py >> telemetry.log 2>&1
```

This will:
- Run every minute
- Collect and send all telemetry
- Log output to `telemetry.log`

### Every 5 Minutes
```
*/5 * * * * cd /home/hamzamira/rover/rover-pi-client && python3 pi-telemetry-client.py >> telemetry.log 2>&1
```

### Every 10 Minutes
```
*/10 * * * * cd /home/hamzamira/rover/rover-pi-client && python3 pi-telemetry-client.py >> telemetry.log 2>&1
```

## Systemd Service (Alternative to Cron)

Create `/etc/systemd/system/rover-telemetry.service`:

```ini
[Unit]
Description=Rover Telemetry Client
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=hamzamira
WorkingDirectory=/home/hamzamira/rover/rover-pi-client
ExecStart=/usr/bin/python3 pi-telemetry-client.py
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable rover-telemetry.service
sudo systemctl start rover-telemetry.service
sudo systemctl status rover-telemetry.service
```

View logs:
```bash
sudo journalctl -u rover-telemetry.service -f
```

## Hardware Sensors Setup

### GPS (Optional)
Install gpsd daemon:
```bash
sudo apt-get install gpsd gpsd-clients
```

Connect GPS module to UART/USB and start gpsd:
```bash
sudo systemctl enable gpsd
sudo systemctl start gpsd
```

### Accelerometer (Optional)
For I2C accelerometer (e.g., MPU6050):
```bash
sudo apt-get install python3-smbus
```

Enable I2C:
```bash
sudo raspi-config
# Interface Options → I2C → Enable
```

## Troubleshooting

### Script not sending data?
1. Check logs: `tail -f /home/hamzamira/rover/rover-pi-client/telemetry.log`
2. Verify token: Check if `config.json` has correct `rover_token`
3. Verify dashboard URL: Make sure it's accessible from the Pi
4. Check network: `curl -I https://your-dashboard.com`

### "Rover Not Found" error?
- Make sure you're logged in as the rover user with a valid token
- Check that the rover exists in the dashboard database
- Verify `rover_id` matches the rover in database

### No data showing in dashboard?
- Check that telemetry is being sent: Look at logs
- Check dashboard database: `SELECT * FROM telemetry_data LIMIT 10;`
- Check Echo/WebSocket connection in dashboard browser console

## API Endpoints Used

The script uses these dashboard API endpoints:

```
POST /api/rover/heartbeat
  - Keeps rover marked as "online"
  - Headers: Authorization: Bearer {token}

POST /api/telemetry
  - Sends individual telemetry reading
  - Payload: {type, data, recorded_at}

POST /api/telemetry/batch
  - Sends multiple telemetry readings at once
  - Useful for catching up after offline period
```

## Example: Running Every Minute on Startup

Add to `~/.bashrc`:
```bash
# Start telemetry service on login
cd /home/hamzamira/rover/rover-pi-client
nohup python3 -u pi-telemetry-client.py >> telemetry.log 2>&1 &
```

Or use systemd timer (more reliable):

Create `/etc/systemd/system/rover-telemetry.timer`:
```ini
[Unit]
Description=Rover Telemetry Timer

[Timer]
OnBootSec=10
OnUnitActiveSec=1min
Persistent=true

[Install]
WantedBy=timers.target
```

## Performance Notes

- Script runs in ~1-2 seconds per execution
- Reads from `/sys` are very fast (~10ms)
- Network request typically takes 200-500ms
- Safe to run every minute without heavy system load
- Total data per send: ~500 bytes
- ~30KB per hour at 1-minute intervals

## Security Notes

- **Protect your API token**: Don't commit `config.json` to git
- **Use HTTPS**: Always use `https://` for dashboard URL
- **Rotate tokens**: Regenerate tokens periodically
- **Network**: Consider VPN for remote connectivity
- **Firewall**: Only expose dashboard to needed IP addresses
