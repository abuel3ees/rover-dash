#!/usr/bin/env python3
"""
Unified Rover Client - Commands + Telemetry
Handles both command execution and system telemetry collection
Runs continuously, polling for commands every 2 seconds and sending telemetry periodically

Place this in /home/hamzamira/rover/rover-pi-client/rover-client.py
Run with: python3 rover-client.py

Or add to crontab:
@reboot cd /home/hamzamira/rover/rover-pi-client && python3 rover-client.py &
"""

import os
import sys
import time
import subprocess
import requests
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

# ============================================================================
# CONFIGURATION - Loads from .env file
# ============================================================================

CONFIG_DIR = Path.home() / 'rover' / 'rover-pi-client'
ENV_FILE = CONFIG_DIR / '.env'

# Load from environment
DASHBOARD_URL = os.getenv('DASHBOARD_URL', '')
API_TOKEN = os.getenv('API_TOKEN', os.getenv('ROVER_TOKEN', ''))
ROVER_ID = os.getenv('ROVER_ID', '')

# Try to load from .env file
if ENV_FILE.exists():
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

# Log file
LOG_FILE = CONFIG_DIR / 'rover.log'

# Telemetry send interval (seconds)
TELEMETRY_INTERVAL = 60  # Send telemetry every 60 seconds
COMMAND_POLL_INTERVAL = 2  # Check for commands every 2 seconds

# ============================================================================
# LOGGING
# ============================================================================

def log(message: str, level: str = 'INFO'):
    """Log message with timestamp"""
    timestamp = datetime.now().isoformat()
    log_message = f"[{timestamp}] [{level}] {message}"
    print(log_message)
    
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(log_message + '\n')
    except:
        pass


def validate_config():
    """Validate that we have all required config"""
    if not DASHBOARD_URL:
        log("ERROR: DASHBOARD_URL not set in .env", 'ERROR')
        return False
    if not API_TOKEN:
        log("ERROR: API_TOKEN (or ROVER_TOKEN) not set in .env", 'ERROR')
        return False
    if not ROVER_ID:
        log("ERROR: ROVER_ID not set in .env", 'ERROR')
        return False
    
    log(f"✓ Configuration loaded: DASHBOARD_URL={DASHBOARD_URL}, ROVER_ID={ROVER_ID}")
    return True


# ============================================================================
# COMMAND HANDLING
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
            log(f"Failed to fetch commands: {response.status_code} - {response.text}", 'WARN')
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
        # Example implementations:
        
        if cmd_type == 'move_forward':
            distance = payload.get('distance', 100)
            log(f"  → Moving forward: {distance}cm")
            # GPIO.output(MOTOR_FORWARD, GPIO.HIGH)
            # time.sleep(distance / 50)  # Approximate timing
            # GPIO.output(MOTOR_FORWARD, GPIO.LOW)
        
        elif cmd_type == 'move_backward':
            distance = payload.get('distance', 100)
            log(f"  → Moving backward: {distance}cm")
            # GPIO.output(MOTOR_BACKWARD, GPIO.HIGH)
            # time.sleep(distance / 50)
            # GPIO.output(MOTOR_BACKWARD, GPIO.LOW)
        
        elif cmd_type == 'turn_left':
            degrees = payload.get('degrees', 90)
            log(f"  → Turning left: {degrees}°")
            # rotate_left(degrees)
        
        elif cmd_type == 'turn_right':
            degrees = payload.get('degrees', 90)
            log(f"  → Turning right: {degrees}°")
            # rotate_right(degrees)
        
        elif cmd_type == 'camera_pan':
            angle = payload.get('angle', 0)
            log(f"  → Camera pan: {angle}°")
            # servo_camera_x.ChangeDutyCycle(angle_to_pwm(angle))
        
        elif cmd_type == 'camera_tilt':
            angle = payload.get('angle', 0)
            log(f"  → Camera tilt: {angle}°")
            # servo_camera_y.ChangeDutyCycle(angle_to_pwm(angle))
        
        elif cmd_type == 'led_on':
            log(f"  → LED ON")
            # GPIO.output(LED_PIN, GPIO.HIGH)
        
        elif cmd_type == 'led_off':
            log(f"  → LED OFF")
            # GPIO.output(LED_PIN, GPIO.LOW)
        
        elif cmd_type == 'stop':
            log(f"  → STOP - All motors off")
            # stop_all_motors()
        
        else:
            log(f"  ⚠️  Unknown command type: {cmd_type}", 'WARN')
        
        # ====== END YOUR CONTROL CODE ======
        
        mark_command_complete(cmd_id, "completed", {"message": f"Successfully executed {cmd_type}"})
        
    except Exception as e:
        log(f"  ❌ Error executing command: {e}", 'ERROR')
        mark_command_complete(cmd_id, "failed", {"error": str(e)})


def mark_command_complete(cmd_id: int, status: str, response: Dict[str, Any]):
    """Mark a command as complete in the dashboard"""
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


# ============================================================================
# TELEMETRY COLLECTION
# ============================================================================

def read_sysfs(path: Path, default: str = '0') -> str:
    """Read value from sysfs"""
    try:
        if path.exists():
            return path.read_text().strip()
    except:
        pass
    return default


def get_temperature_data() -> Dict[str, Any]:
    """Get CPU and system temperature"""
    try:
        temp_data = {}
        
        # Try vcgencmd (Raspberry Pi specific)
        try:
            result = subprocess.run(
                ['vcgencmd', 'measure_temp'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                # Output format: temp=45.5'C
                temp_str = result.stdout.split('=')[1].replace("'C", "").strip()
                temp_data['cpu_temp'] = float(temp_str)
        except:
            pass
        
        # Get system load average
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
                    capacity_file = battery_dir / 'capacity'
                    voltage_file = battery_dir / 'voltage_now'
                    
                    try:
                        battery_info['percentage'] = int(read_sysfs(capacity_file, '100'))
                    except:
                        battery_info['percentage'] = 100
                    
                    try:
                        voltage_uv = int(read_sysfs(voltage_file, '0'))
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
    """Get accelerometer data (simulated if not available)"""
    import math
    
    try:
        # Simulated data (at rest)
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


def collect_and_send_telemetry():
    """Collect all telemetry and send to dashboard"""
    send_heartbeat()
    send_telemetry('temperature', get_temperature_data())
    send_telemetry('battery', get_battery_data())
    send_telemetry('accelerometer', get_accelerometer_data())
    send_telemetry('gps', get_gps_data())


# ============================================================================
# MAIN LOOP
# ============================================================================

def main():
    """Main event loop"""
    if not validate_config():
        return 1
    
    log(f"Starting Rover Client - Connected to {DASHBOARD_URL}")
    log(f"Commands: polling every {COMMAND_POLL_INTERVAL}s")
    log(f"Telemetry: sending every {TELEMETRY_INTERVAL}s")
    
    last_telemetry_time = time.time()
    
    try:
        while True:
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
    
    except KeyboardInterrupt:
        log("Shutting down gracefully...")
        return 0
    except Exception as e:
        log(f"Fatal error: {e}", 'ERROR')
        return 1


if __name__ == '__main__':
    sys.exit(main())
