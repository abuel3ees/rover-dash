# 🚀 Pi Telemetry Client - Quick Reference

## One-Command Setup

```bash
# On your Raspberry Pi
cd /home/hamzamira/rover/rover-pi-client
wget https://raw.githubusercontent.com/your-repo/rover-dashboard/main/pi-telemetry-client.py && \
pip3 install requests && \
python3 pi-telemetry-client.py && \
nano config.json
```

## Get Your API Token

1. Login to dashboard: `https://your-dashboard.com`
2. Click **Rover Settings**
3. Click **API Tokens**
4. Click **Create Token**
5. Copy the token and save to `config.json`

## config.json Template

```json
{
  "dashboard_url": "https://your-dashboard.com",
  "rover_token": "paste_your_token_here",
  "rover_id": "your_rover_id"
}
```

## Automate Sending (Pick One)

### Option 1: Crontab (Simplest)
```bash
crontab -e
# Add: * * * * * cd /home/hamzamira/rover/rover-pi-client && python3 pi-telemetry-client.py
```

### Option 2: Systemd (More Reliable)
```bash
sudo cp rover-telemetry.service /etc/systemd/system/
sudo cp rover-telemetry.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable rover-telemetry.timer
sudo systemctl start rover-telemetry.timer
```

## Test It

```bash
# Run once
python3 pi-telemetry-client.py

# View logs
tail -f telemetry.log

# Check systemd
sudo journalctl -u rover-telemetry.service -f
```

## View in Dashboard

1. Go to dashboard
2. Navigate to **Telemetry**
3. See live data from Pi

## What Gets Sent

✅ **Temperature** - CPU, ambient, motor  
✅ **Battery** - Percentage, voltage, current  
✅ **Accelerometer** - X, Y, Z, pitch, roll  
✅ **GPS** - Location, speed, heading (if available)  
✅ **System Info** - CPU, RAM, storage, OS  
✅ **Heartbeat** - Keep rover "online"  

## Troubleshooting

```bash
# Check log for errors
tail -100 telemetry.log | grep "Error\|✗"

# Test network
curl -I https://your-dashboard.com

# Test API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-dashboard.com/api/telemetry

# Install missing dependencies
pip3 install requests

# Check crontab
crontab -l

# Check systemd
sudo systemctl status rover-telemetry.timer
```

## Files in This Folder

```
/home/hamzamira/rover/rover-pi-client/
├── pi-telemetry-client.py      # Main script
├── config.json                  # Your credentials (KEEP SECRET!)
├── telemetry.log               # Activity log
└── rover-telemetry.* (if using systemd)
```

## API Endpoints Used

- `POST /api/rover/heartbeat` - Keep rover online
- `POST /api/telemetry` - Send one reading
- `POST /api/telemetry/batch` - Send multiple (optional)

## Data Sent Every Minute

- Temperature: ~100 bytes
- Battery: ~100 bytes
- Accelerometer: ~100 bytes
- GPS: ~150 bytes
- Heartbeat: ~50 bytes
- **Total: ~500 bytes/min = 30 KB/hour**

## Security Checklist

- [ ] Token in `config.json` (not in code)
- [ ] `config.json` in `.gitignore`
- [ ] Using HTTPS (not HTTP)
- [ ] Token is specific to this rover
- [ ] Check logs for "401" errors (bad token)

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Rover Not Found` | Check rover_id and rover_token |
| `Connection refused` | Check dashboard_url is correct and reachable |
| `No module named requests` | Run `pip3 install requests` |
| `401 Unauthorized` | Check bearer token is correct |
| `timeout` | Check network connection |

## Environment Variables (Alternative)

```bash
export DASHBOARD_URL="https://your-dashboard.com"
export ROVER_TOKEN="your_token_here"
export ROVER_ID="your_rover_id"
python3 pi-telemetry-client.py
```

## Next Steps

1. ✅ Copy script to Pi
2. ✅ Install requests: `pip3 install requests`
3. ✅ Get API token from dashboard
4. ✅ Edit config.json
5. ✅ Test: `python3 pi-telemetry-client.py`
6. ✅ Automate with crontab or systemd
7. ✅ Check dashboard telemetry page
8. ✅ Monitor logs: `tail -f telemetry.log`

## Support

- Full setup guide: `PI_TELEMETRY_SETUP.md`
- Detailed readme: `PI_CLIENT_README.md`
- Dashboard docs: Check your dashboard help section
