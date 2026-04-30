#!/usr/bin/env python3
"""
Camera Server - Streams video from Raspberry Pi Camera to a local MediaMTX server.
Place this in /home/hamzamira/rover/rover-pi-client/camera_server.py
Run with: python3 camera_server.py

This publishes to a local RTSP endpoint that your dashboard or browser player can consume.
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
STREAM_DESTINATION = os.getenv('STREAM_DESTINATION', os.getenv('STREAM_URL', 'rtsp://localhost:8554/cam'))

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


def start_local_stream():
    """Start streaming to the local MediaMTX server via FFmpeg"""
    global ffmpeg_process
    
    try:
        # FFmpeg command to stream video from camera to local RTSP
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
            '-rtsp_transport', 'tcp',
            '-f', 'rtsp',
            STREAM_DESTINATION,
        ]
        
        print(f"🔄 Connecting to local stream destination: {STREAM_DESTINATION}")
        
        ffmpeg_process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=10 ** 6
        )
        print(f"✓ FFmpeg process started (PID: {ffmpeg_process.pid})")
        print("✓ Streaming to local MediaMTX server...")
        return True
    except Exception as e:
        print(f"❌ Failed to start FFmpeg: {e}")
        import traceback
        traceback.print_exc()
        return False


def stream_to_local_stream():
    """Continuously stream frames to the local server via FFmpeg"""
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
                print(f"✓ {frame_count} frames sent to local stream")
                
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
        'streaming_to_local_server': ffmpeg_process is not None and ffmpeg_process.poll() is None
    }), 200


@app.route('/stream-status')
def stream_status():
    """Get local streaming status"""
    is_streaming = ffmpeg_process is not None and ffmpeg_process.poll() is None
    return jsonify({
        'streaming': is_streaming,
        'destination': STREAM_DESTINATION,
        'platform': 'Local RTSP',
        'message': 'Streaming to local MediaMTX' if is_streaming else 'Not streaming'
    }), 200


if __name__ == "__main__":
    print("=" * 70)
    print("  Camera Server - Local RTSP Streaming")
    print("=" * 70)
    print("")
    
    print(f"✓ Stream destination: {STREAM_DESTINATION}")
    print("")

    # Start local streaming in background thread
    if start_local_stream():
        stream_thread = threading.Thread(target=stream_to_local_stream, daemon=True)
        stream_thread.start()
        print("✓ Streaming thread started")
        print("")
    else:
        print("❌ Failed to start local streaming")
        print("")
    
    try:
        print("Starting Flask server on http://0.0.0.0:5000")
        print("Health check: http://0.0.0.0:5000/health")
        print("Stream status: http://0.0.0.0:5000/stream-status")
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
