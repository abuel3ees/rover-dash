# 🤖 Rover Pi Telemetry Client

Complete Python solution for collecting system telemetry from your Raspberry Pi and sending it to the Rover Dashboard.

## 📋 What It Collects

| Data Type | Details |
|-----------|---------|
| **Temperature** | CPU, ambient, motor temps |
| **Battery** | Percentage, voltage, current, status |
| **Accelerometer** | X/Y/Z axis, pitch, roll angles |
| **GPS** | Latitude, longitude, altitude, speed, heading, satellites |
| **System Info** | CPU, RAM, storage, OS version |

## 🚀 Quick Start (5 minutes)

### On Your Raspberry Pi

```bash
# Clone and setup
cd /home/hamzamira/rover/rover-pi-client
wget https://raw.githubusercontent.com/your-repo/rover-dashboard/main/pi-telemetry-client.py
pip3 install requests

# Run to create config
python3 pi-telemetry-client.py

# Edit the config
nano config.json
```

Edit `config.json`:
```json
{
  "dashboard_url": "https://your-dashboard.com",
  "rover_token": "your-api-token-from-dashboard",
  "rover_id": "your-rover-id"
}
```

### On Your Dashboard

1. **Create API Token**:
   - Navigate to Rover Settings → API Tokens
   - Click "Create Token"
   - Copy the token

2. **Get Your Rover ID**:
   - It's in the database or dashboard URL

3. **Get Your Dashboard URL**:
   - Use your deployment URL (e.g., `https://dashboard.example.com`)

### Test the Script

```bash
python3 pi-telemetry-client.py
```

You should see:
```
[2026-03-26T12:30:45.123456] ==================================================
[2026-03-26T12:30:45.234567] Collecting telemetry data...
[2026-03-26T12:30:45.345678] ✓ Heartbeat sent: 200
[2026-03-26T12:30:45.456789] ✓ Sent temperature: 201
[2026-03-26T12:30:45.567890] ✓ Sent battery: 201
[2026-03-26T12:30:45.678901] ✓ Sent accelerometer: 201
[2026-03-26T12:30:45.789012] ✓ Sent gps: 201
[2026-03-26T12:30:45.890123] ==================================================
```

## 📅 Automation Setup

### Option 1: Crontab (Simple)

```bash
# Edit crontab
crontab -e

# Add this line (runs every minute)
* * * * * cd /home/hamzamira/rover/rover-pi-client && python3 pi-telemetry-client.py >> telemetry.log 2>&1

# Save and exit (Ctrl+X, then Y, then Enter)
```

Check if it's working:
```bash
tail -f /home/hamzamira/rover/rover-pi-client/telemetry.log
```

### Option 2: Systemd Service + Timer (Recommended)

```bash
# Copy service and timer files
sudo cp rover-telemetry.service /etc/systemd/system/
sudo cp rover-telemetry.timer /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable rover-telemetry.timer
sudo systemctl start rover-telemetry.timer

# Check status
sudo systemctl status rover-telemetry.timer
sudo journalctl -u rover-telemetry.service -f
```

## 📊 View Data in Dashboard

Once telemetry is being sent:

1. **Go to Dashboard**
2. **Click "Telemetry"** in navigation
3. **See live temperature, battery, accelerometer, GPS data**
4. **Charts auto-update** as new data arrives

## 🔧 Configuration

### Environment Variables (Alternative to config.json)

```bash
export DASHBOARD_URL="https://your-dashboard.com"
export ROVER_TOKEN="your-api-token"
export ROVER_ID="your-rover-id"
python3 pi-telemetry-client.py
```

### Custom Intervals

Change how often data is collected:

- **Every minute** (default): `* * * * *`
- **Every 5 minutes**: `*/5 * * * *`
- **Every 10 minutes**: `*/10 * * * *`
- **Hourly**: `0 * * * *`

## 📁 Files

| File | Purpose |
|------|---------|
| `pi-telemetry-client.py` | Main script - collects and sends all data |
| `config.json` | Configuration (created on first run) |
| `telemetry.log` | Log file showing all activity |
| `rover-telemetry.service` | Systemd service definition |
| `rover-telemetry.timer` | Systemd timer for periodic execution |
| `PI_TELEMETRY_SETUP.md` | Detailed setup guide |

## 🐛 Troubleshooting

### Script not sending data?

```bash
# Check the log
tail -f /home/hamzamira/rover/rover-pi-client/telemetry.log

# Common issues:
# - "Rover Not Found": Wrong rover token or rover_id
# - "Connection refused": Dashboard URL unreachable
# - "No module named requests": pip3 install requests
```

### Test network connectivity

```bash
# Check if dashboard is reachable
curl -I https://your-dashboard.com

# Test API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-dashboard.com/api/telemetry
```

### Manual test

```bash
# Run script once
python3 pi-telemetry-client.py

# Check if data arrived in dashboard
# Or check database
sqlite3 /path/to/database.sqlite "SELECT * FROM telemetry_data LIMIT 5;"
```

## 📈 Performance

- **Execution time**: ~1-2 seconds per run
- **Network bandwidth**: ~500 bytes per transmission
- **Data per hour** (1-min intervals): ~30 KB
- **CPU usage**: <1% (only during execution)
- **Memory**: ~15 MB

## 🔒 Security

1. **Protect your token**: Don't commit `config.json` to git
2. **Use HTTPS**: Always
3. **Rotate tokens**: Regenerate monthly
4. **Firewall**: Restrict dashboard access if possible

Add to `.gitignore`:
```
config.json
telemetry.log
```

## 🛠️ Advanced: Custom Sensors

To add custom sensors, edit `pi-telemetry-client.py` and add methods like:

```python
def get_custom_data(self):
    """Get data from your custom sensor"""
    return {
        'sensor_name': 'value',
        'another_metric': 42
    }
```

Then add to `collect_and_send()`:

```python
custom_data = self.get_custom_data()
if custom_data:
    self.send_telemetry('custom', custom_data)
```

## 📚 API Reference

### Endpoints Used

```
POST /api/rover/heartbeat
  - Keep rover marked as "online"

POST /api/telemetry
  - Send single telemetry reading
  - Body: {type, data, recorded_at}

POST /api/telemetry/batch
  - Send multiple readings (future enhancement)
```

### Data Types Supported

- `gps` - GPS coordinates and location
- `battery` - Power system status
- `temperature` - Thermal sensors
- `accelerometer` - Motion sensors

## 📞 Support

If you encounter issues:

1. Check the logs: `tail -f telemetry.log`
2. Verify config: `cat config.json`
3. Test manually: `python3 pi-telemetry-client.py`
4. Check network: `curl -I https://your-dashboard.com`

## 📝 License

Part of the Rover Dashboard system.
