#!/usr/bin/env python3
"""
Rover Pi Client - Main Entry Point
Connects to the Rover Dashboard server and handles remote control
"""

import json
import logging
import signal
import sys
import threading
import time
from datetime import datetime
from typing import Any

import socketio
from config import (
    API_TOKEN,
    API_URL,
    ROVER_NAME,
    DEBUG,
    MOTOR_PINS,
    CAMERA_ENABLED,
    TELEMETRY_INTERVAL,
)
from telemetry import TelemetryCollector
from motors import MotorController
from camera import CameraStream

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Socket.IO client
sio = socketio.Client(
    reconnection=True,
    reconnection_delay=1,
    reconnection_delay_max=5,
    reconnection_attempts=0,
    http_session=None,
)

# Global state
is_connected = False
is_running = True
motor_controller: MotorController | None = None
telemetry_collector: TelemetryCollector | None = None
camera_stream: CameraStream | None = None


# ═══════════════════════════════════════════════════════════════════════════
# Socket.IO Event Handlers
# ═══════════════════════════════════════════════════════════════════════════


@sio.event
def connect():
    """Handle successful connection to server"""
    global is_connected
    is_connected = True
    logger.info(f"Connected to server: {API_URL}")

    # Authenticate and register rover
    sio.emit('auth', {
        'token': API_TOKEN,
        'rover_name': ROVER_NAME,
        'version': '1.0.0',
    })


@sio.event
def disconnect():
    """Handle disconnection from server"""
    global is_connected
    is_connected = False
    logger.warning("Disconnected from server")


@sio.on('auth_success')
def on_auth_success(data):
    """Handle successful authentication"""
    logger.info(f"Authentication successful: {data}")
    sio.emit('rover_status', {
        'rover_name': ROVER_NAME,
        'status': 'ready',
        'is_online': True,
        'timestamp': datetime.now().isoformat(),
    })


@sio.on('auth_failure')
def on_auth_failure(data):
    """Handle authentication failure"""
    logger.error(f"Authentication failed: {data}")
    sio.disconnect()


@sio.on('command')
def on_command(data):
    """Handle incoming command from dashboard"""
    try:
        command_type = data.get('type')
        payload = data.get('payload', {})

        logger.debug(f"Received command: {command_type} - {payload}")

        if not motor_controller:
            logger.error("Motor controller not initialized")
            return

        if command_type == 'move':
            direction = payload.get('direction', 'forward')
            speed = payload.get('speed', 50)
            motor_controller.move(direction, speed)

        elif command_type == 'rotate':
            direction = payload.get('direction', 'left')
            speed = payload.get('speed', 50)
            motor_controller.rotate(direction, speed)

        elif command_type == 'stop':
            motor_controller.stop()

        elif command_type == 'speed':
            speed = payload.get('speed', 50)
            motor_controller.set_speed(speed)

        elif command_type == 'camera':
            action = payload.get('action')
            if camera_stream:
                if action == 'pan_left':
                    camera_stream.pan(-10)
                elif action == 'pan_right':
                    camera_stream.pan(10)
                elif action == 'tilt_up':
                    camera_stream.tilt(-10)
                elif action == 'tilt_down':
                    camera_stream.tilt(10)

        # Send command acknowledgment
        sio.emit('command_executed', {
            'type': command_type,
            'status': 'executed',
            'timestamp': datetime.now().isoformat(),
        })

    except Exception as e:
        logger.error(f"Error handling command: {e}")
        sio.emit('command_failed', {
            'error': str(e),
            'timestamp': datetime.now().isoformat(),
        })


@sio.on('emergency_stop')
def on_emergency_stop():
    """Handle emergency stop command"""
    logger.warning("Emergency stop received!")
    if motor_controller:
        motor_controller.stop()
    sio.emit('emergency_stop_ack', {'timestamp': datetime.now().isoformat()})


# ═══════════════════════════════════════════════════════════════════════════
# Telemetry Thread
# ═══════════════════════════════════════════════════════════════════════════


def telemetry_loop():
    """Continuously collect and send telemetry data"""
    global telemetry_collector, is_running

    telemetry_collector = TelemetryCollector()

    while is_running:
        try:
            if not is_connected:
                time.sleep(1)
                continue

            # Collect telemetry
            telemetry = telemetry_collector.collect()

            # Send to server
            if telemetry:
                for sensor_type, data in telemetry.items():
                    sio.emit('telemetry', {
                        'type': sensor_type,
                        'data': data,
                        'recorded_at': datetime.now().isoformat(),
                    })

            time.sleep(TELEMETRY_INTERVAL)

        except Exception as e:
            logger.error(f"Error in telemetry loop: {e}")
            time.sleep(1)


# ═══════════════════════════════════════════════════════════════════════════
# Initialization
# ═══════════════════════════════════════════════════════════════════════════


def initialize_hardware():
    """Initialize hardware controllers"""
    global motor_controller, camera_stream

    try:
        logger.info("Initializing motor controller...")
        motor_controller = MotorController(MOTOR_PINS)
        logger.info("✓ Motor controller initialized")

        if CAMERA_ENABLED:
            logger.info("Initializing camera stream...")
            camera_stream = CameraStream()
            logger.info("✓ Camera stream initialized")

    except Exception as e:
        logger.error(f"Failed to initialize hardware: {e}")
        sys.exit(1)


def connect_to_server():
    """Connect to the Rover Dashboard server"""
    try:
        # Parse URL
        url_parts = API_URL.rstrip('/').split('://')
        if len(url_parts) != 2:
            raise ValueError(f"Invalid API_URL: {API_URL}")

        protocol, host = url_parts
        socket_url = f"wss://{host}" if protocol == "https" else f"ws://{host}"

        logger.info(f"Connecting to server: {socket_url}")
        sio.connect(socket_url, transports=['websocket'])

        # Wait for connection
        max_retries = 30
        retries = 0
        while not is_connected and retries < max_retries:
            time.sleep(0.5)
            retries += 1

        if not is_connected:
            logger.error("Failed to establish connection after retries")
            sys.exit(1)

        logger.info("✓ Connected to server")

    except Exception as e:
        logger.error(f"Connection failed: {e}")
        sys.exit(1)


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    global is_running

    logger.info(f"\nReceived signal {signum}, shutting down...")
    is_running = False

    # Stop motor
    if motor_controller:
        motor_controller.stop()
        motor_controller.cleanup()

    # Close camera
    if camera_stream:
        camera_stream.cleanup()

    # Disconnect from server
    if is_connected:
        sio.disconnect()

    logger.info("Shutdown complete")
    sys.exit(0)


def main():
    """Main entry point"""
    global is_running

    logger.info("=" * 60)
    logger.info(f"Rover Pi Client - {ROVER_NAME}")
    logger.info(f"Server: {API_URL}")
    logger.info("=" * 60)

    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Initialize hardware
    initialize_hardware()

    # Connect to server
    connect_to_server()

    # Start telemetry thread
    telemetry_thread = threading.Thread(target=telemetry_loop, daemon=True)
    telemetry_thread.start()
    logger.info("✓ Telemetry thread started")

    logger.info("✓ Rover client ready and waiting for commands")

    # Keep main thread alive
    try:
        while is_running:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)


if __name__ == '__main__':
    main()
