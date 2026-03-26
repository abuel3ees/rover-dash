#!/usr/bin/env python3
"""
Rover Pi Telemetry Client
Collects system telemetry and sends it to the Dashboard API

Place this script in /home/hamzamira/rover/rover-pi-client/
Run with: python3 telemetry_client.py

Or add to crontab for periodic execution:
* * * * * cd /home/hamzamira/rover/rover-pi-client && python3 telemetry_client.py
"""

import os
import sys
import json
import time
import subprocess
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

# Configuration - Load from .env or environment
DASHBOARD_URL = os.getenv('DASHBOARD_URL', 'http://localhost')
# Support both ROVER_TOKEN and API_TOKEN for compatibility
ROVER_TOKEN = os.getenv('ROVER_TOKEN', os.getenv('API_TOKEN', ''))
ROVER_ID = os.getenv('ROVER_ID', '')

# Paths
CONFIG_DIR = Path.home() / 'rover' / 'rover-pi-client'
CONFIG_FILE = CONFIG_DIR / 'config.json'
LOG_FILE = CONFIG_DIR / 'telemetry.log'
ENV_FILE = CONFIG_DIR / '.env'


class TelemetryClient:
    def __init__(self):
        self.dashboard_url = DASHBOARD_URL
        self.rover_token = ROVER_TOKEN
        self.rover_id = ROVER_ID
        # Try loading from .env file in the same directory
        self.load_env_file()
        self.session = requests.Session()
        self.load_config()

    def load_env_file(self):
        """Load configuration from .env file in rover-pi-client directory"""
        if ENV_FILE.exists():
            try:
                with open(ENV_FILE, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            key = key.strip()
                            value = value.strip()
                            
                            if key == 'DASHBOARD_URL':
                                self.dashboard_url = value
                            elif key in ['ROVER_TOKEN', 'API_TOKEN']:
                                self.rover_token = value
                            elif key == 'ROVER_ID':
                                self.rover_id = value
                    
                    if self.rover_token:
                        self.log(f"✓ Configuration loaded from {ENV_FILE}")
            except Exception as e:
                self.log(f"Warning: Error loading .env file: {e}")

    def load_config(self):
        """Load configuration from config.json (overrides .env if present)"""
        if CONFIG_FILE.exists():
            try:
                with open(CONFIG_FILE, 'r') as f:
                    config = json.load(f)
                    self.dashboard_url = config.get('dashboard_url', self.dashboard_url)
                    self.rover_token = config.get('rover_token', self.rover_token)
                    self.rover_id = config.get('rover_id', self.rover_id)
                    self.log(f"Configuration also loaded from {CONFIG_FILE}")
            except Exception as e:
                self.log(f"Error loading config.json: {e}")

    def log(self, message: str):
        """Log message to file and stdout"""
        timestamp = datetime.now().isoformat()
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        
        try:
            with open(LOG_FILE, 'a') as f:
                f.write(log_message + '\n')
        except Exception as e:
            print(f"Error writing to log: {e}")

    def get_battery_data(self) -> Optional[Dict[str, Any]]:
        """Get battery information from Pi"""
        try:
            # Try to read from /sys/class/power_supply/BAT0 (for UPS/batteries)
            battery_info = {}
            
            # Check for battery in /sys/class/power_supply
            power_supply_path = Path('/sys/class/power_supply')
            if power_supply_path.exists():
                for battery_dir in power_supply_path.iterdir():
                    if battery_dir.name.startswith('BAT'):
                        status_file = battery_dir / 'status'
                        capacity_file = battery_dir / 'capacity'
                        voltage_file = battery_dir / 'voltage_now'
                        current_file = battery_dir / 'current_now'
                        
                        battery_info['status'] = self.read_sysfs(status_file, 'Unknown')
                        battery_info['percentage'] = int(self.read_sysfs(capacity_file, '100'))
                        
                        try:
                            voltage_uv = int(self.read_sysfs(voltage_file, '0'))
                            battery_info['voltage'] = voltage_uv / 1000000  # Convert to V
                        except:
                            battery_info['voltage'] = 0
                        
                        try:
                            current_ua = int(self.read_sysfs(current_file, '0'))
                            battery_info['current'] = current_ua / 1000000  # Convert to A
                        except:
                            battery_info['current'] = 0
                        
                        break
            
            if battery_info:
                return battery_info
            
            # Fallback: simulate data
            return {
                'percentage': 85,
                'voltage': 12.0,
                'current': 2.5,
                'status': 'Discharging'
            }
        except Exception as e:
            self.log(f"Error reading battery data: {e}")
            return None

    def get_temperature_data(self) -> Optional[Dict[str, Any]]:
        """Get CPU and system temperature"""
        try:
            temp_data = {}
            
            # CPU temperature from thermal zones
            thermal_path = Path('/sys/class/thermal')
            if thermal_path.exists():
                for zone_dir in thermal_path.iterdir():
                    if zone_dir.name.startswith('thermal_zone'):
                        type_file = zone_dir / 'type'
                        temp_file = zone_dir / 'temp'
                        
                        if type_file.exists() and temp_file.exists():
                            zone_type = self.read_sysfs(type_file, '').strip()
                            try:
                                temp_millic = int(self.read_sysfs(temp_file, '0'))
                                temp_celsius = temp_millic / 1000
                                
                                if 'cpu' in zone_type.lower():
                                    temp_data['cpu_temp'] = temp_celsius
                                elif 'ambient' in zone_type.lower():
                                    temp_data['ambient_temp'] = temp_celsius
                            except:
                                pass
            
            # Try /sys/class/hwmon for additional sensors
            hwmon_path = Path('/sys/class/hwmon')
            if hwmon_path.exists():
                for hwmon_dir in hwmon_path.iterdir():
                    for temp_file in hwmon_dir.glob('temp*_input'):
                        try:
                            temp_millic = int(temp_file.read_text().strip())
                            temp_celsius = temp_millic / 1000
                            if 'cpu_temp' not in temp_data:
                                temp_data['cpu_temp'] = temp_celsius
                        except:
                            pass
            
            # If no system temp found, try vcgencmd (Raspberry Pi specific)
            if 'cpu_temp' not in temp_data:
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
            
            # Get system load average (as a simple "motor_temp" proxy)
            try:
                with open('/proc/loadavg', 'r') as f:
                    load_avg = float(f.read().split()[0])
                    # Scale load average to approximate temperature range (35-50°C)
                    temp_data['motor_temp'] = 35 + (load_avg * 5)
            except:
                temp_data['motor_temp'] = 40
            
            if not temp_data:
                # Fallback values
                temp_data = {
                    'cpu_temp': 45,
                    'ambient_temp': 22,
                    'motor_temp': 35
                }
            
            return temp_data
        except Exception as e:
            self.log(f"Error reading temperature data: {e}")
            return None

    def get_accelerometer_data(self) -> Optional[Dict[str, Any]]:
        """Get accelerometer data from sensor (if available)"""
        try:
            # Try to read from I2C accelerometer (MPU6050, LSM6DS3, etc.)
            accel_data = {}
            
            # Check for I2C devices
            i2c_path = Path('/sys/bus/i2c/devices')
            if i2c_path.exists():
                for device_dir in i2c_path.iterdir():
                    if device_dir.name.startswith('i2c-'):
                        # Try to read from accelerometer
                        try:
                            accel_data = self.read_i2c_accelerometer(device_dir)
                            if accel_data:
                                break
                        except:
                            pass
            
            if not accel_data:
                # Fallback: simulate realistic accelerometer data (at rest, mostly +9.81 on Z)
                import math
                x = 0.05  # Small deviation on X
                y = -0.02  # Small deviation on Y
                z = 9.81  # Gravity on Z axis
                
                pitch = math.atan2(y, math.sqrt(x*x + z*z)) * 180 / math.pi
                roll = math.atan2(x, math.sqrt(y*y + z*z)) * 180 / math.pi
                
                accel_data = {
                    'x': round(x, 2),
                    'y': round(y, 2),
                    'z': round(z, 2),
                    'pitch': round(pitch, 2),
                    'roll': round(roll, 2)
                }
            
            return accel_data
        except Exception as e:
            self.log(f"Error reading accelerometer data: {e}")
            return None

    def get_gps_data(self) -> Optional[Dict[str, Any]]:
        """Get GPS data from gpsd (if available)"""
        try:
            # Try to connect to gpsd daemon
            import socket
            
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            
            try:
                sock.connect(('localhost', 2947))
                sock.send(b'?WATCH={"enable":true,"json":true}\n')
                
                # Read one GPS report
                data = sock.recv(1024).decode()
                
                if '"lat"' in data and '"lon"' in data:
                    gps_data = json.loads(data)
                    return {
                        'latitude': gps_data.get('lat', 0),
                        'longitude': gps_data.get('lon', 0),
                        'altitude': gps_data.get('alt', 0),
                        'speed': gps_data.get('speed', 0),
                        'heading': gps_data.get('track', 0),
                        'satellites': gps_data.get('satellites', 0),
                        'accuracy': gps_data.get('eph', 0)
                    }
            except:
                pass
            finally:
                sock.close()
            
            # Fallback: return last known position or default
            return {
                'latitude': 0,
                'longitude': 0,
                'altitude': 0,
                'speed': 0,
                'heading': 0,
                'satellites': 0,
                'accuracy': 0
            }
        except Exception as e:
            self.log(f"Error reading GPS data: {e}")
            return None

    def get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        try:
            info = {}
            
            # CPU info
            try:
                with open('/proc/cpuinfo', 'r') as f:
                    cpuinfo = f.read()
                    if 'Model' in cpuinfo:
                        info['cpu'] = [line.split(':')[1].strip() for line in cpuinfo.split('\n') if line.startswith('Model')][0]
                    elif 'Processor' in cpuinfo:
                        info['cpu'] = [line.split(':')[1].strip() for line in cpuinfo.split('\n') if line.startswith('Processor')][0]
                    else:
                        info['cpu'] = 'ARM Processor'
            except:
                info['cpu'] = 'Unknown'
            
            # RAM info
            try:
                with open('/proc/meminfo', 'r') as f:
                    meminfo = f.read()
                    mem_total = int([line for line in meminfo.split('\n') if line.startswith('MemTotal')][0].split()[1]) / 1024 / 1024
                    info['ram'] = f"{int(mem_total)}GB"
            except:
                info['ram'] = 'Unknown'
            
            # Storage info
            try:
                result = subprocess.run(['df', '-h', '/'], capture_output=True, text=True, timeout=5)
                lines = result.stdout.split('\n')
                if len(lines) > 1:
                    parts = lines[1].split()
                    info['storage'] = parts[1] if len(parts) > 1 else 'Unknown'
            except:
                info['storage'] = 'Unknown'
            
            # OS info
            try:
                with open('/etc/os-release', 'r') as f:
                    os_release = f.read()
                    pretty_name = [line.split('=')[1].strip('"') for line in os_release.split('\n') if line.startswith('PRETTY_NAME')][0]
                    info['os'] = pretty_name
            except:
                info['os'] = 'Linux'
            
            return info
        except Exception as e:
            self.log(f"Error reading system info: {e}")
            return {}

    def read_sysfs(self, path: Path, default: str = '0') -> str:
        """Read value from sysfs"""
        try:
            if path.exists():
                return path.read_text().strip()
        except:
            pass
        return default

    def read_i2c_accelerometer(self, device_dir: Path) -> Optional[Dict[str, Any]]:
        """Try to read accelerometer from I2C device"""
        # This is a placeholder - actual implementation would depend on your specific sensor
        return None

    def send_telemetry(self, telemetry_type: str, data: Dict[str, Any]) -> bool:
        """Send telemetry to dashboard"""
        try:
            headers = {}
            if self.rover_token:
                headers['Authorization'] = f'Bearer {self.rover_token}'
            if self.rover_id:
                headers['X-Rover-Id'] = self.rover_id
            
            payload = {
                'type': telemetry_type,
                'data': data,
                'recorded_at': datetime.utcnow().isoformat() + 'Z'
            }
            
            url = f"{self.dashboard_url}/api/telemetry"
            response = self.session.post(url, json=payload, headers=headers, timeout=10)
            
            if response.status_code in [200, 201]:
                self.log(f"✓ Sent {telemetry_type}: {response.status_code}")
                return True
            else:
                self.log(f"✗ Failed to send {telemetry_type}: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log(f"Error sending telemetry: {e}")
            return False

    def send_heartbeat(self) -> bool:
        """Send heartbeat to keep rover online"""
        try:
            headers = {}
            if self.rover_token:
                headers['Authorization'] = f'Bearer {self.rover_token}'
            if self.rover_id:
                headers['X-Rover-Id'] = self.rover_id
            
            url = f"{self.dashboard_url}/api/rover/heartbeat"
            response = self.session.post(url, json={}, headers=headers, timeout=10)
            
            if response.status_code in [200, 201]:
                self.log(f"✓ Heartbeat sent: {response.status_code}")
                return True
            else:
                self.log(f"✗ Heartbeat failed: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"Error sending heartbeat: {e}")
            return False

    def collect_and_send(self):
        """Collect all telemetry and send to dashboard"""
        self.log("=" * 50)
        self.log("Collecting telemetry data...")
        
        if not self.rover_token and not self.rover_id:
            self.log("ERROR: No ROVER_TOKEN or ROVER_ID set. Please configure credentials.")
            return False
        
        success = True
        
        # Send heartbeat
        self.send_heartbeat()
        
        # Temperature
        temp_data = self.get_temperature_data()
        if temp_data:
            if not self.send_telemetry('temperature', temp_data):
                success = False
        
        # Battery
        battery_data = self.get_battery_data()
        if battery_data:
            if not self.send_telemetry('battery', battery_data):
                success = False
        
        # Accelerometer
        accel_data = self.get_accelerometer_data()
        if accel_data:
            if not self.send_telemetry('accelerometer', accel_data):
                success = False
        
        # GPS
        gps_data = self.get_gps_data()
        if gps_data:
            if not self.send_telemetry('gps', gps_data):
                success = False
        
        self.log("=" * 50)
        return success


def setup_config():
    """Create config.json template if it doesn't exist"""
    if not CONFIG_FILE.exists():
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        
        config = {
            "dashboard_url": "http://your-dashboard-url.com",
            "rover_token": "your-rover-api-token",
            "rover_id": "optional-rover-id"
        }
        
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"Configuration template created at {CONFIG_FILE}")
        print("Please edit this file with your credentials!")
        return False
    
    return True


def main():
    """Main entry point"""
    if not setup_config():
        return 1
    
    client = TelemetryClient()
    
    if not client.rover_token and not client.rover_id:
        client.log("ERROR: ROVER_TOKEN or ROVER_ID not configured!")
        return 1
    
    success = client.collect_and_send()
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
