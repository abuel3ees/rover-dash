#!/usr/bin/env python3
"""
Camera Server - Streams video from Raspberry Pi Camera to ngrok
Place this in /home/hamzamira/rover/rover-pi-client/camera_server.py
Run with: python3 camera_server.py

Or let pi-master-start.py manage it automatically
"""

import cv2
from flask import Flask, Response
from flask_cors import CORS
from picamera2 import Picamera2
import logging

# Suppress Flask werkzeug logs
logging.getLogger('werkzeug').setLevel(logging.ERROR)

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/video_feed": {
        "origins": "*",
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "ngrok-skip-browser-warning"]
    }
})

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


def generate_frames():
    """Generate MJPEG frames from camera"""
    while True:
        try:
            if picam2:
                frame = picam2.capture_array()
                # Convert from RGB to BGR for OpenCV compatibility
                frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            else:
                # Fallback: create a dummy frame if camera unavailable (1280x720)
                frame = cv2.zeros((720, 1280, 3), dtype='uint8')
                cv2.putText(frame, "Camera Not Available", (450, 360),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Compress frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
            frame_bytes = buffer.tobytes()
            
            # Yield frame in MJPEG format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        except Exception as e:
            print(f"Error generating frame: {e}")
            continue


@app.route('/video_feed')
def video_feed():
    """Stream video feed"""
    response = Response(generate_frames(),
                        mimetype='multipart/x-mixed-replace; boundary=frame')
    response.headers['ngrok-skip-browser-warning'] = 'true'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, ngrok-skip-browser-warning'
    return response


@app.route('/health')
def health():
    """Health check endpoint"""
    return {'status': 'ok', 'service': 'camera-server'}, 200


if __name__ == "__main__":
    print("=" * 70)
    print("  Camera Server Starting")
    print("=" * 70)
    print("")
    print("Video stream available at: http://0.0.0.0:5000/video_feed")
    print("Health check at:           http://0.0.0.0:5000/health")
    print("")
    print("Press Ctrl+C to stop")
    print("")
    
    try:
        app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
    except KeyboardInterrupt:
        print("\nShutting down camera server...")
        if picam2:
            picam2.stop()
        print("Camera server stopped")
