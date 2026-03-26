#!/usr/bin/env python3
"""
Camera Server - Streams video from Raspberry Pi Camera to Twitch Live
Place this in /home/hamzamira/rover/rover-pi-client/camera_server.py
Run with: python3 camera_server.py

This streams directly to Twitch Live, then you embed the stream in the dashboard
"""

import cv2
import subprocess
import os
from flask import Flask, jsonify
from picamera2 import Picamera2
import logging
import threading

# Suppress Flask werkzeug logs
logging.getLogger('werkzeug').setLevel(logging.ERROR)

app = Flask(__name__)

# Configuration
TWITCH_STREAM_KEY = os.getenv('TWITCH_STREAM_KEY', '')
TWITCH_RTMP_URL = 'rtmps://live-fra.twitch.tv/app'

# Initialize camera
try:
    picam2 = Picamera2()
    config = picam2.create_preview_configuration(
        main={"size": (1280, 720), "format": "BGR888"}
    )
    picam2.configure(config)
    picam2.start()
    print("✓ Camera initialized successfully (1280x720)")
except Exception as e:
    print(f"✗ Failed to initialize camera: {e}")
    picam2 = None

# FFmpeg streaming process
ffmpeg_process = None


def start_youtube_stream():
    """Start streaming to Twitch Live via FFmpeg"""
    global ffmpeg_process
    
    if not TWITCH_STREAM_KEY:
        print("⚠️  TWITCH_STREAM_KEY not set in environment")
        return False
    
    try:
        # FFmpeg command to stream video from camera to Twitch
        cmd = [
            'ffmpeg',
            '-f', 'rawvideo',
            '-pix_fmt', 'bgr24',
            '-s', '1280x720',
            '-r', '30',
            '-i', 'pipe:0',
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-b:v', '2500k',
            '-maxrate', '2500k',
            '-bufsize', '5000k',
            '-f', 'flv',
            f'{TWITCH_RTMP_URL}/{TWITCH_STREAM_KEY}'
        ]
        
        ffmpeg_process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=10 ** 8
        )
        print(f"✓ FFmpeg process started (PID: {ffmpeg_process.pid})")
        print(f"✓ Streaming to Twitch...")
        return True
    except Exception as e:
        print(f"❌ Failed to start FFmpeg: {e}")
        return False


def stream_to_youtube():
    """Continuously stream frames to Twitch via FFmpeg"""
    global ffmpeg_process
    
    if not ffmpeg_process:
        return
    
    frame_count = 0
    while ffmpeg_process and ffmpeg_process.poll() is None:
        try:
            if picam2:
                frame = picam2.capture_array()
                # Convert from RGB to BGR for OpenCV compatibility
                frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            else:
                # Fallback: create a dummy frame if camera unavailable
                frame = cv2.zeros((720, 1280, 3), dtype='uint8')
                cv2.putText(frame, "Camera Not Available", (450, 360),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Write frame to FFmpeg stdin
            ffmpeg_process.stdin.write(frame.tobytes())
            ffmpeg_process.stdin.flush()
            
            frame_count += 1
            if frame_count % 30 == 0:
                print(f"Streamed {frame_count} frames to YouTube")
        except Exception as e:
            print(f"Error streaming frame: {e}")
            break
    
    if ffmpeg_process:
        ffmpeg_process.stdin.close()
        ffmpeg_process.wait()


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'camera-server',
        'streaming_to_youtube': ffmpeg_process is not None and ffmpeg_process.poll() is None
    }), 200


@app.route('/youtube-status')
def youtube_status():
    """Get Twitch streaming status"""
    is_streaming = ffmpeg_process is not None and ffmpeg_process.poll() is None
    return jsonify({
        'streaming': is_streaming,
        'has_stream_key': bool(TWITCH_STREAM_KEY),
        'platform': 'Twitch',
        'message': 'Streaming to Twitch Live' if is_streaming else 'Not streaming'
    }), 200


if __name__ == "__main__":
    print("=" * 70)
    print("  Camera Server - Twitch Live Streaming")
    print("=" * 70)
    print("")
    print("Setup Instructions:")
    print("1. Go to https://www.twitch.tv/settings/channel")
    print("2. Scroll to 'Stream Key' and click 'Show'")
    print("3. Copy your Stream Key")
    print("4. Set environment variable: export TWITCH_STREAM_KEY='your_key_here'")
    print("5. Run this script")
    print("")
    print("Stream will be UNLISTED (not in directory, only via direct link)")
    print("")
    print("Health check at: http://0.0.0.0:5000/health")
    print("Twitch status: http://0.0.0.0:5000/youtube-status")
    print("")
    print("Press Ctrl+C to stop")
    print("")
    
    # Start Twitch streaming in background thread
    if start_youtube_stream():
        stream_thread = threading.Thread(target=stream_to_youtube, daemon=True)
        stream_thread.start()
        print("✓ Streaming thread started")
    
    try:
        app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
    except KeyboardInterrupt:
        print("\nShutting down camera server...")
        if ffmpeg_process:
            ffmpeg_process.stdin.close()
            ffmpeg_process.wait()
        if picam2:
            picam2.stop()
        print("Camera server stopped")

