# Rover Pi Setup Guide

This guide walks you through setting up your Raspberry Pi to run the rover client with camera streaming and ngrok tunneling.

## Prerequisites

- Raspberry Pi 4+ with Raspbian OS
- Raspberry Pi Camera Module (CSI/ribbon cable connected)
- Internet connection (for ngrok tunneling)
- Dashboard URL from your deployed rover-dashboard

## Step 1: Create Directory Structure

```bash
mkdir -p ~/rover/rover-pi-client/logs
cd ~/rover/rover-pi-client
```

## Step 2: Install Dependencies

### System packages
```bash
# Update package lists
sudo apt-get update

# Install required system packages
sudo apt-get install -y \
  python3-pip \
  python3-venv \
  libatlas-base-dev \
  libjasper-dev \
  libtiff5 \
  libjasper1 \
  libharfbuzz0b \
  libwebp6 \
  libtiff5 \
  libjasper1 \
  libharfbuzz0b \
  libwebp6 \
  python3-libcamera \
  libcamera-tools \
  python3-picamera2 \
  ngrok

# Note: picamera2 comes pre-installed on recent Raspberry Pi OS
```

### Python packages
```bash
pip3 install \
  requests \
  opencv-python \
  flask \
  flask-cors
```

## Step 3: Set Up ngrok

1. **Create ngrok account** (if you don't have one):
   - Go to https://ngrok.com
   - Sign up for free account
   - Get your authtoken from dashboard

2. **Authenticate ngrok**:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

## Step 4: Configure Your Rover

Create `.env` file in `~/rover/rover-pi-client/`:

```bash
cat > ~/.env << 'EOF'
# Dashboard Configuration
DASHBOARD_URL=https://your-ngrok-url-or-domain.com

# API Authentication (get from dashboard /rover/settings)
API_TOKEN=your-generated-api-token-here

# Rover ID (get from dashboard /rover/settings)
ROVER_ID=1

EOF
```

**⚠️ Important**: Replace these with values from your dashboard:
- `DASHBOARD_URL`: Your dashboard URL (e.g., from DigitalOcean or local)
- `API_TOKEN`: Generate at `/rover/settings` → "Generate Token"
- `ROVER_ID`: Copy from `/rover/settings` at the top (the Rover ID display)

## Step 5: Copy Scripts

Copy these files to `~/rover/rover-pi-client/`:
- `rover-client.py` - Main rover client
- `camera_server.py` - Camera streaming server
- `pi-master-start.py` - Master control script (runs everything)

## Step 6: Make Scripts Executable

```bash
chmod +x ~/rover/rover-pi-client/pi-master-start.py
chmod +x ~/rover/rover-pi-client/rover-client.py
chmod +x ~/rover/rover-pi-client/camera_server.py
```

## Step 7: Run the Master Script

```bash
cd ~/rover/rover-pi-client
python3 pi-master-start.py
```

This will:
1. ✓ Validate all files and dependencies
2. ✓ Start rover-client.py (commands + telemetry)
3. ✓ Start camera_server.py (video streaming on port 5000)
4. ✓ Start ngrok tunnel (public access to camera)
5. ✓ Monitor all processes (restart if they die)

### Expected Output:
```
======================================================================
  ROVER MASTER START SCRIPT
======================================================================

[...validation checks...]

======================================================================
  SERVICES RUNNING
======================================================================

📊 Rover Client:     Commands polling + Telemetry (every 60s)
📹 Camera Server:    http://127.0.0.1:5000/video_feed
🌐 ngrok Tunnel:     Public tunnel to camera server

🎉 ngrok tunnel URL: https://abc123-def456.ngrok.io
   Camera stream: https://abc123-def456.ngrok.io/video_feed
   Update dashboard settings with this URL

Press Ctrl+C to stop all services
```

## Step 8: Update Dashboard Camera Settings

1. Go to dashboard `/rover/settings`
2. Paste the ngrok tunnel URL in "Camera Stream URL" field
   - Example: `https://abc123-def456.ngrok.io/video_feed`
3. Click "Save"

Camera should now stream to dashboard!

## Step 9: (Optional) Run on Boot

To run the rover client automatically on Pi startup:

```bash
# Edit crontab
crontab -e

# Add this line (scroll to end and add):
@reboot sleep 10 && cd ~/rover/rover-pi-client && python3 pi-master-start.py >> ~/rover/rover-pi-client/logs/boot.log 2>&1 &
```

## Troubleshooting

### Camera not streaming
- Check camera is connected to CSI ribbon
- Run: `vcgencmd get_camera` should show detected=1
- Check `logs/camera-server.log` for errors

### 404 errors from rover-client
- Verify ROVER_ID matches dashboard (check `/rover/settings`)
- Verify API_TOKEN was generated (check `/rover/settings`)
- Check `.env` file has correct values

### ngrok tunnel not showing URL
- Check `logs/ngrok.log` for errors
- Make sure ngrok authtoken is set: `ngrok config list`
- Try: `ngrok http 5000` manually to test

### Commands not executing
- Check telemetry is being sent (look for `📊 Collecting and sending telemetry...` in logs)
- Send a test command from dashboard
- Check `logs/rover-client.log` for execution logs

## Log Files

All services log to `~/rover/rover-pi-client/logs/`:
- `master.log` - Master script logs
- `rover-client.log` - Rover commands + telemetry
- `camera-server.log` - Camera streaming
- `ngrok.log` - ngrok tunnel logs
- `boot.log` - Boot startup logs (if running at boot)

## Monitoring

Check status of all services:
```bash
# Show all running processes
ps aux | grep -E "(rover-client|camera_server|ngrok)" | grep -v grep

# Tail live logs
tail -f ~/rover/rover-pi-client/logs/master.log
```

## Next Steps

1. ✅ Verify camera streams to dashboard
2. ✅ Send test commands from dashboard
3. ✅ Verify telemetry appears in dashboard
4. ✅ Add GPIO control for motors/sensors in `rover-client.py`
5. ✅ Customize commands to match your rover hardware

## Support

For issues:
1. Check the relevant log file in `~/rover/rover-pi-client/logs/`
2. Verify `.env` file has correct values
3. Test camera manually: `python3 -c "from picamera2 import Picamera2; print(Picamera2().controls)"`
4. Test ngrok: `ngrok http 5000` in separate terminal

Good luck! 🚀
