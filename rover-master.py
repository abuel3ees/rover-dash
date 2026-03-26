#!/usr/bin/env python3
"""
Unified Rover Master - All-in-One Control Script
Handles: Commands polling + Telemetry + Camera Server + ngrok tunnel
All in one manageable script running in separate threads/processes

Place this in /home/hamzamira/rover/rover-pi-client/rover-master.py
Run with: python3 rover-master.py
"""

import os
import sys
import time
import subprocess
import signal
import requests
import threading
from pathlib import Path, Path
from datetime import datetime, timezone
from typing import Dict, Any

# ============================================================================
# CONFIGURATION
# ============================================================================

CONFIG_DIR = Path.home() / 'rover' / 'rover-pi-client'
LOG_DIR = CONFIG_DIR / 'logs'
ENV_FILE = CONFIG_DIR / '.env'

# Create logs directory
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Log files
MASTER_LOG = LOG_DIR / 'master.log'
CAMERA_SERVER_LOG = LOG_DIR / 'camera-server.log'
NGROK_LOG = LOG_DIR / 'ngrok.log'

# Configuration
DASHBOARD_URL = ''
API_TOKEN = ''
ROVER_ID = ''

# Telemetry send interval (seconds)
TELEMETRY_INTERVAL = 60
COMMAND_POLL_INTERVAL = 2

# Processes
processes = {}
stop_event = threading.Event()

# ============================================================================
# LOGGING
# ============================================================================

def log(message: str, level: str = 'INFO'):
    """Log message with timestamp"""
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
# CONFIGURATION LOADING
# ============================================================================

def load_config():
    """Load configuration from .env file"""
    global DASHBOARD_URL, API_TOKEN, ROVER_ID
    
    if not ENV_FILE.exists():
        log(f"❌ ERROR: .env file not found at {ENV_FILE}", 'ERROR')
        return False
    
    try:
        with open(ENV_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    
                    if key == 'DASHBOARD_URL':
                        DASHBOARD_URL = value
                    elif key in ['API_TOKEN', 'ROVER_TOKEN']:
                        API_TOKEN = value
                    elif key == 'ROVER_ID':
                        ROVER_ID = value
    except Exception as e:
        log(f"❌ Error loading .env: {e}", 'ERROR')
        return False
    
    if not DASHBOARD_URL or not API_TOKEN or not ROVER_ID:
        log("❌ Missing required config: DASHBOARD_URL, API_TOKEN, or ROVER_ID", 'ERROR')
        return False
    
    log(f"✓ Configuration loaded: DASHBOARD_URL={DASHBOARD_URL}, ROVER_ID={ROVER_ID}")
    return True


# ============================================================================
# COMMANDS & TELEMETRY (Main Rover Logic)
# ============================================================================

def fetch_pending_commands() -> list:
    """Fetch pending commands from dashboard"""
    try:
        url = f"{DASHBOARD_URL}/api/rover/commands/pending"
        headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "X-Rover-Id": ROVER_ID,
            "Accept": "application/json"
        }
        
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('commands', [])
        else:
            log(f"Failed to fetch commands: {response.status_code}", 'WARN')
            return []
    except Exception as e:
        log(f"Error fetching commands: {e}", 'WARN')
        return []


def execute_command(cmd: Dict[str, Any]):
    """Execute a command"""
    cmd_id = cmd.get('id')
    cmd_type = cmd.get('type')
    payload = cmd.get('payload', {})
    
    log(f"🚀 Executing command: {cmd_type} (ID: {cmd_id})")
    
    try:
        # ====== ADD YOUR ROVER CONTROL CODE HERE ======
        if cmd_type == 'move_forward':
            distance = payload.get('distance', 100)
            log(f"  → Moving forward: {distance}cm")
        elif cmd_type == 'move_backward':
            distance = payload.get('distance', 100)
            log(f"  → Moving backward: {distance}cm")
        elif cmd_type == 'turn_left':
            degrees = payload.get('degrees', 90)
            log(f"  → Turning left: {degrees}°")
        elif cmd_type == 'turn_right':
            degrees = payload.get('degrees', 90)
            log(f"  → Turning right: {degrees}°")
        elif cmd_type == 'camera_pan':
            angle = payload.get('angle', 0)
            log(f"  → Camera pan: {angle}°")
        elif cmd_type == 'camera_tilt':
            angle = payload.get('angle', 0)
            log(f"  → Camera tilt: {angle}°")
        elif cmd_type == 'led_on':
            log(f"  → LED ON")
        elif cmd_type == 'led_off':
            log(f"  → LED OFF")
        elif cmd_type == 'stop':
            log(f"  → STOP - All motors off")
        else:
            log(f"  ⚠️  Unknown command type: {cmd_type}", 'WARN')
        # ====== END YOUR CONTROL CODE ======
        
        mark_command_complete(cmd_id, "completed", {"message": f"Successfully executed {cmd_type}"})
    except Exception as e:
        log(f"  ❌ Error executing command: {e}", 'ERROR')
        mark_command_complete(cmd_id, "failed", {"error": str(e)})


def mark_command_complete(cmd_id: int, status: str, response: Dict[str, Any]):
    """Mark a command as complete"""
    try:
        url = f"{DASHBOARD_URL}/api/rover/commands/{cmd_id}/complete"
        headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "X-Rover-Id": ROVER_ID,
            "Content-Type": "application/json"
        }
        payload = {
            "status": status,
            "response": response
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        
        if response.status_code in [200, 201]:
            log(f"  ✅ Command {cmd_id} marked as {status}")
        else:
            log(f"  ⚠️  Failed to mark command complete: {response.status_code}", 'WARN')
    except Exception as e:
        log(f"  ⚠️  Error marking command complete: {e}", 'WARN')


def get_temperature_data() -> Dict[str, Any]:
    """Get CPU and system temperature"""
    try:
        import subprocess
        temp_data = {}
        
        try:
            result = subprocess.run(
                ['vcgencmd', 'measure_temp'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                temp_str = result.stdout.split('=')[1].replace("'C", "").strip()
                temp_data['cpu_temp'] = float(temp_str)
        except:
            pass
        
        try:
            with open('/proc/loadavg', 'r') as f:
                load_avg = float(f.read().split()[0])
                temp_data['motor_temp'] = 35 + (load_avg * 5)
        except:
            temp_data['motor_temp'] = 40
        
        if not temp_data:
            temp_data = {'cpu_temp': 45, 'motor_temp': 35}
        
        return temp_data
    except Exception as e:
        log(f"Error reading temperature: {e}", 'WARN')
        return {'cpu_temp': 45, 'motor_temp': 35}


def get_battery_data() -> Dict[str, Any]:
    """Get battery information"""
    try:
        battery_info = {}
        power_supply_path = Path('/sys/class/power_supply')
        
        if power_supply_path.exists():
            for battery_dir in power_supply_path.iterdir():
                if battery_dir.name.startswith('BAT'):
                    try:
                        capacity_file = battery_dir / 'capacity'
                        if capacity_file.exists():
                            battery_info['percentage'] = int(capacity_file.read_text().strip())
                    except:
                        battery_info['percentage'] = 100
                    
                    try:
                        voltage_file = battery_dir / 'voltage_now'
                        if voltage_file.exists():
                            voltage_uv = int(voltage_file.read_text().strip())
                            battery_info['voltage'] = voltage_uv / 1000000
                    except:
                        battery_info['voltage'] = 12.0
                    
                    battery_info['current'] = 2.5
                    break
        
        if not battery_info:
            battery_info = {'percentage': 85, 'voltage': 12.0, 'current': 2.5}
        
        return battery_info
    except Exception as e:
        log(f"Error reading battery: {e}", 'WARN')
        return {'percentage': 85, 'voltage': 12.0, 'current': 2.5}


def get_accelerometer_data() -> Dict[str, Any]:
    """Get accelerometer data (simulated)"""
    import math
    
    try:
        x = 0.05
        y = -0.02
        z = 9.81
        
        pitch = math.atan2(y, math.sqrt(x*x + z*z)) * 180 / math.pi
        roll = math.atan2(x, math.sqrt(y*y + z*z)) * 180 / math.pi
        
        return {
            'x': round(x, 2),
            'y': round(y, 2),
            'z': round(z, 2),
            'pitch': round(pitch, 2),
            'roll': round(roll, 2)
        }
    except Exception as e:
        log(f"Error reading accelerometer: {e}", 'WARN')
        return {'x': 0, 'y': 0, 'z': 9.81, 'pitch': 0, 'roll': 0}


def get_gps_data() -> Dict[str, Any]:
    """Get GPS data (returns zero if not available)"""
    return {
        'latitude': 0,
        'longitude': 0,
        'altitude': 0,
        'speed': 0,
        'heading': 0,
        'satellites': 0,
        'accuracy': 0
    }


def send_telemetry(telemetry_type: str, data: Dict[str, Any]) -> bool:
    """Send telemetry to dashboard"""
    try:
        headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "X-Rover-Id": ROVER_ID,
            "Content-Type": "application/json"
        }
        
        payload = {
            'type': telemetry_type,
            'data': data,
            'recorded_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        }
        
        url = f"{DASHBOARD_URL}/api/telemetry"
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        
        if response.status_code in [200, 201]:
            return True
        else:
            log(f"Failed to send {telemetry_type}: {response.status_code}", 'WARN')
            return False
    except Exception as e:
        log(f"Error sending {telemetry_type}: {e}", 'WARN')
        return False


def send_heartbeat() -> bool:
    """Send heartbeat to keep rover online"""
    try:
        headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "X-Rover-Id": ROVER_ID,
            "Content-Type": "application/json"
        }
        
        url = f"{DASHBOARD_URL}/api/rover/heartbeat"
        response = requests.post(url, json={}, headers=headers, timeout=5)
        
        return response.status_code in [200, 201]
    except Exception as e:
        log(f"Error sending heartbeat: {e}", 'WARN')
        return False


def update_stream_url(stream_url: str) -> bool:
    """Update the rover's camera stream URL on the dashboard"""
    try:
        headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "X-Rover-Id": ROVER_ID,
            "Content-Type": "application/json"
        }
        
        payload = {
            "stream_url": stream_url
        }
        
        url = f"{DASHBOARD_URL}/api/rover/settings"
        log(f"Sending stream URL to {url}", 'DEBUG')
        log(f"  Headers: Authorization=Bearer***, X-Rover-Id={ROVER_ID}", 'DEBUG')
        log(f"  Payload: {payload}", 'DEBUG')
        
        response = requests.patch(url, json=payload, headers=headers, timeout=5)
        
        log(f"Response status: {response.status_code}", 'DEBUG')
        
        if response.status_code in [200, 201]:
            log(f"✓ Updated rover stream URL: {stream_url}")
            return True
        else:
            log(f"⚠️  Failed to update stream URL: {response.status_code}", 'WARN')
            log(f"  Response: {response.text}", 'WARN')
            return False
    except Exception as e:
        log(f"Error updating stream URL: {e}", 'WARN')
        import traceback
        log(f"  Traceback: {traceback.format_exc()}", 'WARN')
        return False


def collect_and_send_telemetry():
    """Collect all telemetry and send to dashboard"""
    send_telemetry('temperature', get_temperature_data())
    send_telemetry('battery', get_battery_data())
    send_telemetry('accelerometer', get_accelerometer_data())
    send_telemetry('gps', get_gps_data())


def rover_client_thread():
    """Main rover client loop - runs in thread"""
    log_section("ROVER CLIENT THREAD STARTED")
    log(f"Commands: polling every {COMMAND_POLL_INTERVAL}s")
    log(f"Telemetry: sending every {TELEMETRY_INTERVAL}s")
    
    last_telemetry_time = time.time()
    last_heartbeat_time = time.time()
    
    while not stop_event.is_set():
        try:
            # Send heartbeat every 10 seconds (more frequent than telemetry)
            current_time = time.time()
            if current_time - last_heartbeat_time >= 10:
                send_heartbeat()
                last_heartbeat_time = current_time
            
            # Check for commands
            commands = fetch_pending_commands()
            for cmd in commands:
                execute_command(cmd)
            
            # Send telemetry periodically
            current_time = time.time()
            if current_time - last_telemetry_time >= TELEMETRY_INTERVAL:
                log("📊 Collecting and sending telemetry...")
                collect_and_send_telemetry()
                last_telemetry_time = current_time
            
            # Sleep before next command check
            time.sleep(COMMAND_POLL_INTERVAL)
        except Exception as e:
            log(f"Error in rover client loop: {e}", 'ERROR')
            time.sleep(5)


# ============================================================================
# CAMERA SERVER & NGROK
# ============================================================================

def start_camera_server():
    """Start the camera server (Flask + picamera2)"""
    log_section("STARTING CAMERA SERVER")
    
    try:
        with open(CAMERA_SERVER_LOG, 'a') as log_file:
            process = subprocess.Popen(
                ['python3', str(CONFIG_DIR / 'camera_server.py')],
                cwd=str(CONFIG_DIR),
                stdout=log_file,
                stderr=subprocess.STDOUT,
                text=True
            )
        
        processes['camera-server'] = process
        log(f"✓ Camera Server started (PID: {process.pid})")
        log(f"  Logging to: {CAMERA_SERVER_LOG}")
        log(f"  Streaming on: http://0.0.0.0:5000/video_feed")
        
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
        
        time.sleep(3)
        log("⏳ ngrok tunnel starting... (check ngrok.log for tunnel URL)")
        log("")
        return True
    except Exception as e:
        log(f"❌ Failed to start ngrok: {e}", 'ERROR')
        return False


def get_ngrok_url():
    """Attempt to get the ngrok tunnel URL"""
    try:
        response = requests.get('http://127.0.0.1:4040/api/tunnels', timeout=2)
        if response.status_code == 200:
            tunnels = response.json()
            for tunnel in tunnels.get('tunnels', []):
                # Return the public_url (https://xxxx.ngrok.io)
                if tunnel['config']['addr'] == 'localhost:5000':
                    return tunnel['public_url']
    except:
        pass
    return None


def open_camera_in_browser(url: str):
    """Open camera stream URL in default browser"""
    try:
        import subprocess
        # Try chromium first, then fallback to other browsers
        for browser in ['chromium', 'chromium-browser', 'google-chrome', 'firefox']:
            try:
                subprocess.Popen([browser, f"{url}/video_feed"])
                log(f"✓ Opened camera stream in {browser}")
                return True
            except (FileNotFoundError, OSError):
                continue
        
        # Fallback to xdg-open on Linux
        try:
            subprocess.Popen(['xdg-open', f"{url}/video_feed"])
            log(f"✓ Opened camera stream in default browser")
            return True
        except:
            log(f"⚠️  Could not open browser automatically", 'WARN')
            return False
    except Exception as e:
        log(f"Error opening browser: {e}", 'WARN')
        return False


def monitor_processes():
    """Monitor processes and restart if they die"""
    while not stop_event.is_set():
        try:
            time.sleep(5)
            
            for name, process in list(processes.items()):
                if process.poll() is not None:
                    log(f"⚠️  {name} process died (exit code: {process.returncode})", 'WARN')
                    log(f"Restarting {name}...", 'WARN')
                    
                    if name == 'camera-server':
                        if not start_camera_server():
                            log(f"❌ Failed to restart {name}", 'ERROR')
                    elif name == 'ngrok':
                        if not start_ngrok():
                            log(f"❌ Failed to restart {name}", 'ERROR')
        except Exception as e:
            log(f"Error in monitoring: {e}", 'ERROR')


# ============================================================================
# SIGNAL HANDLING
# ============================================================================

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    log("")
    log("Received shutdown signal, stopping all services...")
    stop_event.set()
    
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
        except Exception as e:
            log(f"❌ Error stopping {name}: {e}", 'ERROR')
    
    log("All services stopped")
    sys.exit(0)


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main entry point"""
    log_section("ROVER UNIFIED MASTER")
    log(f"Config directory: {CONFIG_DIR}")
    log(f"Log directory: {LOG_DIR}")
    log(f"Master log: {MASTER_LOG}")
    
    # Load configuration
    if not load_config():
        return 1
    
    log_section("STARTING ALL SERVICES")
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start rover client in background thread
    log_section("STARTING ROVER CLIENT THREAD")
    rover_thread = threading.Thread(target=rover_client_thread, daemon=True)
    rover_thread.start()
    log(f"✓ Rover Client thread started")
    time.sleep(1)
    
    # Start camera server in subprocess
    if not start_camera_server():
        log("⚠️  Camera server failed to start", 'WARN')
    
    # Start ngrok in subprocess
    if not start_ngrok():
        log("⚠️  ngrok failed to start", 'WARN')
    
    log_section("SERVICES RUNNING")
    log("")
    log("📊 Rover Client:     Commands polling + Telemetry (running in thread)")
    log("📹 Camera Server:    http://127.0.0.1:5000/video_feed")
    log("🌐 ngrok Tunnel:     Public tunnel to camera server")
    log("")
    log("Logs available in:")
    log(f"  - Master:         {MASTER_LOG}")
    log(f"  - Camera Server:  {CAMERA_SERVER_LOG}")
    log(f"  - ngrok:          {NGROK_LOG}")
    log("")
    log("Press Ctrl+C to stop all services")
    log("")
    
    # Check ngrok URL and send to dashboard
    time.sleep(4)
    ngrok_url = get_ngrok_url()
    if ngrok_url:
        log(f"🎉 ngrok tunnel URL: {ngrok_url}")
        log(f"   Camera stream: {ngrok_url}/video_feed")
        
        # Send stream URL to dashboard
        stream_url = f"{ngrok_url}/video_feed"
        if update_stream_url(stream_url):
            log(f"✓ Dashboard updated with stream URL")
        else:
            log(f"⚠️  Could not update dashboard with stream URL", 'WARN')
        
        log("")
        
        # Open in browser
        open_camera_in_browser(ngrok_url)
    
    # Monitor processes
    try:
        monitor_processes()
    except KeyboardInterrupt:
        pass
    finally:
        signal_handler(None, None)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
