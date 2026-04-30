#!/usr/bin/env python3
"""
Camera Server - Streams video from Raspberry Pi Camera to YouTube Live
Place this in /home/hamzamira/rover/rover-pi-client/camera_server.py
Run with: python3 camera_server.py

This streams directly to YouTube Live, then you embed the stream in the dashboard.
"""

import cv2
import subprocess
import os
import sys
from flask import Flask, jsonify
from picamera2 import Picamera2
import logging
import threading

# Suppress Flask werkzeug logs
logging.getLogger('werkzeug').setLevel(logging.ERROR)

app = Flask(__name__)

# Configuration
YOUTUBE_STREAM_KEY = os.getenv('YOUTUBE_STREAM_KEY', os.getenv('YOUTUBE_LIVE_STREAM_KEY', ''))
YOUTUBE_RTMP_URL = os.getenv('YOUTUBE_RTMP_URL', 'rtmps://a.rtmp.youtube.com/live2')

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
    """Start streaming to YouTube Live via FFmpeg"""
    global ffmpeg_process
    
    if not YOUTUBE_STREAM_KEY:
        print("⚠️  YOUTUBE_STREAM_KEY not set in environment")
        return False
    
    try:
        # FFmpeg command to stream video from camera to YouTube
        cmd = [
            'ffmpeg',
            '-loglevel', 'error',  # Only show errors
            '-f', 'rawvideo',
            '-pix_fmt', 'bgr24',  # Camera is configured as BGR888
            '-s', '1280x720',
            '-r', '30',
            '-i', 'pipe:0',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',  # Faster than veryfast
            '-b:v', '2500k',
            '-maxrate', '2500k',
            '-bufsize', '5000k',
            '-x264opts', 'nal-hrd=cbr:force-cfr=1',
            '-g', '60',  # GOP size
            '-f', 'flv',
            '-flvflags', 'no_duration_filesize',
            f'{YOUTUBE_RTMP_URL}/{YOUTUBE_STREAM_KEY}'
        ]
        
        print(f"🔄 Connecting to YouTube RTMP: {YOUTUBE_RTMP_URL}")
        print(f"🔑 Stream Key: {YOUTUBE_STREAM_KEY[:10]}...")
        
        ffmpeg_process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=10 ** 6
        )
        print(f"✓ FFmpeg process started (PID: {ffmpeg_process.pid})")
        print(f"✓ Streaming to YouTube Live...")
        return True
    except Exception as e:
        print(f"❌ Failed to start FFmpeg: {e}")
        import traceback
        traceback.print_exc()
        return False


def stream_to_youtube():
    """Continuously stream frames to YouTube via FFmpeg"""
    global ffmpeg_process
    
    if not ffmpeg_process:
        print("❌ FFmpeg process not initialized")
        return
    
    frame_count = 0
    error_count = 0
    
    print("📹 Starting frame capture loop...")
    
    while ffmpeg_process and ffmpeg_process.poll() is None:
        try:
            if picam2:
                frame = picam2.capture_array()
                # Picamera2 is configured as BGR888; keep as-is for bgr24 FFmpeg input
            else:
                # Fallback: create a dummy frame if camera unavailable
                frame = cv2.zeros((720, 1280, 3), dtype='uint8')
                cv2.putText(frame, "Camera Not Available", (450, 360),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Write raw frame bytes to FFmpeg stdin
            try:
                ffmpeg_process.stdin.write(frame.tobytes())
                ffmpeg_process.stdin.flush()
            except (BrokenPipeError, OSError) as e:
                error_count += 1
                print(f"⚠️  Pipe error: {e}")
                if error_count > 5:
                    print("❌ Too many pipe errors, exiting")
                    break
                continue
            
            frame_count += 1
            if frame_count % 300 == 0:  # Print every 10 seconds at 30fps
                print(f"✓ {frame_count} frames sent to YouTube")
                
        except KeyboardInterrupt:
            print("⏸️  Interrupted by user")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            break
    
    print("📹 Frame capture loop ended")
    
    if ffmpeg_process:
        try:
            ffmpeg_process.stdin.close()
        except:
            pass
        try:
            ffmpeg_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            ffmpeg_process.kill()
        print("✓ FFmpeg process stopped")


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
    """Get YouTube streaming status"""
    is_streaming = ffmpeg_process is not None and ffmpeg_process.poll() is None
    return jsonify({
        'streaming': is_streaming,
        'has_stream_key': bool(YOUTUBE_STREAM_KEY),
        'platform': 'YouTube',
        'message': 'Streaming to YouTube Live' if is_streaming else 'Not streaming'
    }), 200


if __name__ == "__main__":
    print("=" * 70)
    print("  Camera Server - YouTube Live Streaming")
    print("=" * 70)
    print("")
    
    if not YOUTUBE_STREAM_KEY:
        print("⚠️  YOUTUBE_STREAM_KEY not set in environment")
        print("   Camera server will start but NOT stream to YouTube")
        print("   To enable: add YOUTUBE_STREAM_KEY to .env file")
        print("")
    else:
        print(f"✓ YOUTUBE_STREAM_KEY found (first 10 chars: {YOUTUBE_STREAM_KEY[:10]}...)")
        print("")
    
    # Start YouTube streaming in background thread (only if key is set)
    if YOUTUBE_STREAM_KEY and start_youtube_stream():
        stream_thread = threading.Thread(target=stream_to_youtube, daemon=True)
        stream_thread.start()
        print("✓ Streaming thread started")
        print("")
    elif YOUTUBE_STREAM_KEY:
        print("❌ Failed to start streaming to YouTube")
        print("")
    
    try:
        print("Starting Flask server on http://0.0.0.0:5000")
        print("Health check: http://0.0.0.0:5000/health")
        print("YouTube status: http://0.0.0.0:5000/youtube-status")
        print("")
        app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
    except KeyboardInterrupt:
        print("\n\nShutting down camera server...")
        if ffmpeg_process:
            try:
                ffmpeg_process.stdin.close()
            except:
                pass
            ffmpeg_process.wait()
        if picam2:
            picam2.stop()
        print("✓ Camera server stopped")
        sys.exit(0)
