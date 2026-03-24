"""
Configuration file for Rover Pi Client
Update these values to match your setup
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ═══════════════════════════════════════════════════════════════════════════
# Server Configuration
# ═══════════════════════════════════════════════════════════════════════════

# API endpoint (e.g., http://192.168.1.100:8000/api or https://rover.example.com)
API_URL = os.getenv('API_URL', 'http://localhost:8000/api')

# API authentication token (get from dashboard settings)
API_TOKEN = os.getenv('API_TOKEN', '')

# Rover identifier (must be unique)
ROVER_NAME = os.getenv('ROVER_NAME', 'rover-01')

# Debug mode
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'

# ═══════════════════════════════════════════════════════════════════════════
# Hardware Configuration
# ═══════════════════════════════════════════════════════════════════════════

# GPIO pin configuration for motors (BCM numbering)
# Left motor: forward, backward
# Right motor: forward, backward
MOTOR_PINS = {
    'left_forward': 17,
    'left_backward': 27,
    'left_pwm': 12,
    'right_forward': 23,
    'right_backward': 24,
    'right_pwm': 25,
}

# Motor speed (0-100, PWM frequency in Hz)
MOTOR_PWM_FREQ = 1000  # 1kHz
DEFAULT_MOTOR_SPEED = 50  # Percentage

# ═══════════════════════════════════════════════════════════════════════════
# Camera Configuration
# ═══════════════════════════════════════════════════════════════════════════

CAMERA_ENABLED = os.getenv('CAMERA_ENABLED', 'true').lower() == 'true'
CAMERA_RESOLUTION = (640, 480)  # Width, Height
CAMERA_FPS = 30
CAMERA_BITRATE = 1000000  # 1Mbps

# Camera servo pins (for pan/tilt)
CAMERA_PAN_PIN = 18
CAMERA_TILT_PIN = 19

# ═══════════════════════════════════════════════════════════════════════════
# Sensors Configuration
# ═══════════════════════════════════════════════════════════════════════════

# I2C address for various sensors
I2C_BUS = 1  # Raspberry Pi default

# MPU6050 (Accelerometer/Gyroscope)
MPU6050_ADDRESS = 0x68

# Temperature sensor (use CPU temperature by default)
USE_ONEWIRE_TEMP = False
ONEWIRE_DEVICE_ID = '28-000001234567'  # Replace with your sensor ID

# ═══════════════════════════════════════════════════════════════════════════
# Telemetry Configuration
# ═══════════════════════════════════════════════════════════════════════════

# How often to collect telemetry (seconds)
TELEMETRY_INTERVAL = 1

# Which sensors to enable
TELEMETRY_SENSORS = {
    'battery': True,
    'temperature': True,
    'accelerometer': True,
    'gps': False,  # Set to True if you have a GPS module
}

# Battery monitoring via ADC
# Use ADS1115 or MCP3008 for analog readings
BATTERY_ADC_CHANNEL = 0
BATTERY_VOLTAGE_DIVIDER = 3.0  # Voltage divider ratio

# GPS configuration (if enabled)
GPS_SERIAL_PORT = '/dev/ttyUSB0'
GPS_BAUDRATE = 9600

# ═══════════════════════════════════════════════════════════════════════════
# Network Configuration
# ═══════════════════════════════════════════════════════════════════════════

# Socket.IO reconnection settings
SOCKETIO_RECONNECT_DELAY = 1
SOCKETIO_MAX_RETRIES = 0  # Infinite retries

# Connection timeout
CONNECTION_TIMEOUT = 10

# ═══════════════════════════════════════════════════════════════════════════
# Logging Configuration
# ═══════════════════════════════════════════════════════════════════════════

LOG_FILE = '/var/log/rover/rover.log'
LOG_LEVEL = 'DEBUG' if DEBUG else 'INFO'
LOG_MAX_SIZE = 10 * 1024 * 1024  # 10MB
LOG_BACKUP_COUNT = 5

# ═══════════════════════════════════════════════════════════════════════════
# Safety Configuration
# ═══════════════════════════════════════════════════════════════════════════

# Maximum motor speed (as percentage)
MAX_MOTOR_SPEED = 100

# Idle timeout - stop motors if no command received (seconds)
IDLE_TIMEOUT = 30

# Temperature warning thresholds
TEMP_WARNING = 65  # Celsius
TEMP_CRITICAL = 80  # Celsius

# Battery voltage thresholds
BATTERY_WARNING = 25  # Percentage
BATTERY_CRITICAL = 10  # Percentage
