#!/bin/bash
# Debug script for Raspberry Pi rover

echo "========================================="
echo "  ROVER DEBUG - System Check"
echo "========================================="
echo ""

# Check Python
echo "📦 Python Check:"
python3 --version
echo ""

# Check if .env exists
echo "📁 Configuration Check:"
if [ -f ~/rover/rover-pi-client/.env ]; then
    echo "✓ .env file found"
    echo "  Variables set:"
    grep -E "^(DASHBOARD_URL|ROVER_ID|YOUTUBE_STREAM_KEY)" ~/rover/rover-pi-client/.env | sed 's/=.*/=***/' || echo "  (none set)"
else
    echo "❌ .env file NOT found at ~/rover/rover-pi-client/.env"
fi
echo ""

# Check dependencies
echo "📚 Dependencies Check:"
python3 -c "import flask; print('✓ Flask installed')" 2>/dev/null || echo "❌ Flask NOT installed"
python3 -c "import picamera2; print('✓ Picamera2 installed')" 2>/dev/null || echo "❌ Picamera2 NOT installed"
python3 -c "import cv2; print('✓ OpenCV installed')" 2>/dev/null || echo "❌ OpenCV NOT installed"
python3 -c "import requests; print('✓ Requests installed')" 2>/dev/null || echo "❌ Requests NOT installed"
echo ""

# Check FFmpeg
echo "🎥 FFmpeg Check:"
which ffmpeg > /dev/null && ffmpeg -version | head -1 || echo "❌ FFmpeg NOT installed"
echo ""

# Test network connectivity
echo "🌐 Network Check:"
ping -c 1 8.8.8.8 > /dev/null 2>&1 && echo "✓ Internet connection OK" || echo "❌ No internet connection"
echo ""

# Show running processes
echo "⚙️  Running Processes:"
ps aux | grep -E "rover-master|camera_server|ffmpeg" | grep -v grep || echo "  (none running)"
echo ""

echo "========================================="
echo "  To start rover, run:"
echo "  python3 ~/rover/rover-pi-client/rover-master.py"
echo "========================================="
