#!/usr/bin/env python3
"""
Rover Master Start Script
Manages all rover services: Commands + Telemetry, Camera Server, and ngrok tunnel
Runs everything in separate processes and logs them all

Place this in /home/hamzamira/rover/rover-pi-client/pi-master-start.py
Run with: python3 pi-master-start.py

This will start:
1. rover-client.py - Commands polling + telemetry collection
2. camera_server.py - Flask camera stream on port 5000
3. ngrok - Tunnel to camera server on port 5000
"""

import os
import sys
import time
import subprocess
import signal
from pathlib import Path
from datetime import datetime

# ============================================================================
# CONFIGURATION
# ============================================================================

CONFIG_DIR = Path.home() / 'rover' / 'rover-pi-client'
LOG_DIR = CONFIG_DIR / 'logs'
ENV_FILE = CONFIG_DIR / '.env'

# Create logs directory
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Service logs
ROVER_CLIENT_LOG = LOG_DIR / 'rover-client.log'
CAMERA_SERVER_LOG = LOG_DIR / 'camera-server.log'
NGROK_LOG = LOG_DIR / 'ngrok.log'
MASTER_LOG = LOG_DIR / 'master.log'

# Service scripts
ROVER_CLIENT_SCRIPT = CONFIG_DIR / 'rover-client.py'
CAMERA_SERVER_SCRIPT = CONFIG_DIR / 'camera_server.py'

# Processes
processes = {}

# ============================================================================
# LOGGING
# ============================================================================

def log(message: str, level: str = 'INFO'):
    """Log message to console and file"""
    timestamp = datetime.now().isoformat()
    log_message = f"[{timestamp}] [{level}] {message}"
    print(log_message)
    
    try:
        with open(MASTER_LOG, 'a') as f:
            f.write(log_message + '\n')
    except:
        pass


def log_section(title: str):
    """Log a section header"""
    separator = "=" * 70
    log("")
    log(separator)
    log(f"  {title}")
    log(separator)
    log("")


# ============================================================================
# VALIDATION
# ============================================================================

def validate_files():
    """Check if required files exist"""
    log_section("VALIDATING FILES")
    
    if not ENV_FILE.exists():
        log(f"❌ ERROR: .env file not found at {ENV_FILE}", 'ERROR')
        log("   Create it with: DASHBOARD_URL=... API_TOKEN=... ROVER_ID=...", 'ERROR')
        return False
    
    log(f"✓ .env file found at {ENV_FILE}")
    
    if not ROVER_CLIENT_SCRIPT.exists():
        log(f"❌ ERROR: rover-client.py not found at {ROVER_CLIENT_SCRIPT}", 'ERROR')
        return False
    
    log(f"✓ rover-client.py found")
    
    if not CAMERA_SERVER_SCRIPT.exists():
        log(f"❌ ERROR: camera_server.py not found at {CAMERA_SERVER_SCRIPT}", 'ERROR')
        return False
    
    log(f"✓ camera_server.py found")
    
    # Check for ngrok
    try:
        result = subprocess.run(['which', 'ngrok'], capture_output=True, text=True)
        if result.returncode != 0:
            log("❌ ERROR: ngrok not found in PATH", 'ERROR')
            log("   Install with: sudo apt-get install ngrok", 'ERROR')
            return False
        log(f"✓ ngrok found at {result.stdout.strip()}")
    except:
        log("❌ ERROR: Could not check for ngrok", 'ERROR')
        return False
    
    return True


def validate_dependencies():
    """Check for required Python packages"""
    log_section("VALIDATING DEPENDENCIES")
    
    required_packages = {
        'requests': 'requests',
        'cv2': 'opencv-python',
        'flask': 'flask',
        'flask_cors': 'flask-cors',
        'picamera2': 'picamera2',
    }
    
    missing = []
    for module, package_name in required_packages.items():
        try:
            __import__(module)
            log(f"✓ {package_name}")
        except ImportError:
            log(f"❌ {package_name} not installed", 'WARN')
            missing.append(package_name)
    
    if missing:
        log(f"\n⚠️  Missing packages: {', '.join(missing)}", 'WARN')
        log(f"   Install with: pip3 install {' '.join(missing)}", 'WARN')
        return False
    
    return True


# ============================================================================
# PROCESS MANAGEMENT
# ============================================================================

def start_rover_client():
    """Start the rover client (commands + telemetry)"""
    log_section("STARTING ROVER CLIENT")
    
    try:
        with open(ROVER_CLIENT_LOG, 'a') as log_file:
            process = subprocess.Popen(
                ['python3', str(ROVER_CLIENT_SCRIPT)],
                cwd=str(CONFIG_DIR),
                stdout=log_file,
                stderr=subprocess.STDOUT,
                text=True
            )
        
        processes['rover-client'] = process
        log(f"✓ Rover Client started (PID: {process.pid})")
        log(f"  Logging to: {ROVER_CLIENT_LOG}")
        return True
    except Exception as e:
        log(f"❌ Failed to start Rover Client: {e}", 'ERROR')
        return False


def start_camera_server():
    """Start the camera server (Flask + picamera2)"""
    log_section("STARTING CAMERA SERVER")
    
    try:
        with open(CAMERA_SERVER_LOG, 'a') as log_file:
            process = subprocess.Popen(
                ['python3', str(CAMERA_SERVER_SCRIPT)],
                cwd=str(CONFIG_DIR),
                stdout=log_file,
                stderr=subprocess.STDOUT,
                text=True
            )
        
        processes['camera-server'] = process
        log(f"✓ Camera Server started (PID: {process.pid})")
        log(f"  Logging to: {CAMERA_SERVER_LOG}")
        log(f"  Streaming on: http://0.0.0.0:5000/video_feed")
        
        # Wait a moment for server to start
        time.sleep(2)
        return True
    except Exception as e:
        log(f"❌ Failed to start Camera Server: {e}", 'ERROR')
        return False


def start_ngrok():
    """Start ngrok tunnel to camera server on port 5000"""
    log_section("STARTING NGROK TUNNEL")
    
    try:
        with open(NGROK_LOG, 'a') as log_file:
            process = subprocess.Popen(
                ['ngrok', 'http', '5000', '--log=stdout'],
                stdout=log_file,
                stderr=subprocess.STDOUT,
                text=True
            )
        
        processes['ngrok'] = process
        log(f"✓ ngrok started (PID: {process.pid})")
        log(f"  Logging to: {NGROK_LOG}")
        
        # Wait for ngrok to start and get its URL
        time.sleep(3)
        log("")
        log("⏳ ngrok tunnel starting... (check ngrok.log for tunnel URL)")
        log("   The tunnel URL will be displayed in: {NGROK_LOG}")
        log("")
        return True
    except Exception as e:
        log(f"❌ Failed to start ngrok: {e}", 'ERROR')
        return False


def get_ngrok_url():
    """Attempt to get the ngrok tunnel URL"""
    try:
        import requests
        response = requests.get('http://127.0.0.1:4040/api/tunnels', timeout=2)
        if response.status_code == 200:
            tunnels = response.json()
            for tunnel in tunnels.get('tunnels', []):
                if tunnel['config']['addr'] == 'localhost:5000':
                    return tunnel['public_url']
    except:
        pass
    return None


def stop_all():
    """Stop all processes gracefully"""
    log_section("STOPPING ALL SERVICES")
    
    for name, process in processes.items():
        try:
            log(f"Stopping {name} (PID: {process.pid})...")
            process.terminate()
            try:
                process.wait(timeout=5)
                log(f"✓ {name} stopped")
            except subprocess.TimeoutExpired:
                log(f"⚠️  {name} didn't stop, killing...", 'WARN')
                process.kill()
                process.wait()
                log(f"✓ {name} killed")
        except Exception as e:
            log(f"❌ Error stopping {name}: {e}", 'ERROR')
    
    log("All services stopped")


def signal_handler(sig, frame):
    """Handle shutdown signals"""
    log("")
    log("Received shutdown signal, stopping all services...")
    stop_all()
    sys.exit(0)


def monitor_processes():
    """Monitor processes and restart if they die"""
    while True:
        try:
            time.sleep(5)
            
            for name, process in list(processes.items()):
                if process.poll() is not None:  # Process died
                    log(f"⚠️  {name} process died (exit code: {process.returncode})", 'WARN')
                    log(f"Restarting {name}...", 'WARN')
                    
                    if name == 'rover-client':
                        if not start_rover_client():
                            log(f"❌ Failed to restart {name}", 'ERROR')
                    elif name == 'camera-server':
                        if not start_camera_server():
                            log(f"❌ Failed to restart {name}", 'ERROR')
                    elif name == 'ngrok':
                        if not start_ngrok():
                            log(f"❌ Failed to restart {name}", 'ERROR')
        except KeyboardInterrupt:
            break
        except Exception as e:
            log(f"Error in monitoring: {e}", 'ERROR')


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main entry point"""
    log_section("ROVER MASTER START SCRIPT")
    log(f"Config directory: {CONFIG_DIR}")
    log(f"Log directory: {LOG_DIR}")
    log(f"Master log: {MASTER_LOG}")
    
    # Validate everything
    if not validate_files():
        return 1
    
    if not validate_dependencies():
        log("")
        log("⚠️  Some dependencies are missing", 'WARN')
        log("You can continue but some services may fail", 'WARN')
    
    log_section("STARTING ALL SERVICES")
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start all services
    all_started = True
    
    if not start_rover_client():
        all_started = False
    
    if not start_camera_server():
        all_started = False
    
    if not start_ngrok():
        all_started = False
    
    if not all_started:
        log("")
        log("⚠️  Some services failed to start", 'WARN')
        log("Check the logs for details", 'WARN')
    
    log_section("SERVICES RUNNING")
    log("")
    log("📊 Rover Client:     Commands polling + Telemetry (every 60s)")
    log("📹 Camera Server:    http://127.0.0.1:5000/video_feed")
    log("🌐 ngrok Tunnel:     Public tunnel to camera server")
    log("")
    log("Logs available in:")
    log(f"  - Rover Client:   {ROVER_CLIENT_LOG}")
    log(f"  - Camera Server:  {CAMERA_SERVER_LOG}")
    log(f"  - ngrok:          {NGROK_LOG}")
    log(f"  - Master:         {MASTER_LOG}")
    log("")
    log("Press Ctrl+C to stop all services")
    log("")
    
    # Check ngrok URL after a moment
    time.sleep(4)
    ngrok_url = get_ngrok_url()
    if ngrok_url:
        log(f"🎉 ngrok tunnel URL: {ngrok_url}")
        log(f"   Camera stream: {ngrok_url}/video_feed")
        log(f"   Update dashboard settings with this URL")
        log("")
    
    # Monitor processes
    try:
        monitor_processes()
    except KeyboardInterrupt:
        pass
    finally:
        stop_all()
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
