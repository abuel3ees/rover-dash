# Camera Stream Setup for Rover

## Issue: CORS Errors with ngrok

If you see errors like:
```
[Error] Preflight response is not successful. Status code: 404
[Error] Fetch API cannot load due to access control checks.
```

This means your Pi's video stream endpoint needs CORS headers configured.

## Quick Fix - Use Our Provided Script

We've provided a ready-to-use `pi-camera-server.py` that handles CORS properly:

### On Your Raspberry Pi:

```bash
# 1. Install required packages
pip install flask flask-cors opencv-python picamera2

# 2. Copy the script from the repo
curl -O https://raw.githubusercontent.com/abuel3ees/rover-dash/main/pi-camera-server.py

# 3. Run it
python3 pi-camera-server.py

# 4. Expose via ngrok
ngrok http 5000
```

Done! Your video feed now supports CORS.

---

## Solution for Python Flask/FastAPI

### If using Flask (with our script above):

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/video_feed": {
        "origins": "*",
        "methods": ["GET"],
        "allow_headers": ["Content-Type", "ngrok-skip-browser-warning"]
    }
})

@app.route('/video_feed')
def video_feed():
    # Your video streaming code here
    pass
```

### If using FastAPI:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/video_feed")
async def video_feed():
    # Your video streaming code here
    pass
```

### If using basic Python HTTP server:

Add headers to your response:

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class VideoHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/video_feed':
            self.send_response(200)
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=frame')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning')
            self.end_headers()
            # Stream video frames here
```

## After Updating Pi Code:

1. SSH into your Pi
2. Update your rover-pi-client code with CORS headers
3. Restart the rover client: `python3 main.py`
4. Refresh your dashboard and test the video stream

## Alternative: Use Dashboard Proxy

The dashboard has a built-in proxy at `/rover/stream` that can relay the video feed:

1. Make sure your rover's `stream_url` is configured in settings
2. The dashboard will proxy the stream with proper headers

To set stream URL:
```bash
# In dashboard Settings > Rover > Stream URL
# Set to: http://your-pi-ip:5000/video_feed
```

This proxy handles CORS automatically!
