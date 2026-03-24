"""
Camera Stream Module
Handles camera streaming via MJPEG
"""

import logging
import subprocess
import threading
import time
from typing import Optional

logger = logging.getLogger(__name__)


class CameraStream:
    """
    Manages camera stream using picamera2 and motion JPEG
    """

    def __init__(
        self,
        width: int = 640,
        height: int = 480,
        fps: int = 30,
        bitrate: int = 1000000,
        port: int = 8081,
    ):
        """
        Initialize camera stream

        Args:
            width: Frame width in pixels
            height: Frame height in pixels
            fps: Frames per second
            bitrate: Bitrate in bits per second
            port: HTTP server port for streaming
        """
        self.width = width
        self.height = height
        self.fps = fps
        self.bitrate = bitrate
        self.port = port
        self.process: Optional[subprocess.Popen] = None
        self.is_running = False
        self.pan_angle = 0
        self.tilt_angle = 0
        self.servo_left_pin = 18
        self.servo_right_pin = 19
        self.pwm_left = None
        self.pwm_right = None

        self._initialize_camera()

    def _initialize_camera(self):
        """Initialize camera hardware"""
        try:
            # Try modern picamera2 approach first
            try:
                import picamera2

                logger.info("✓ Camera (picamera2) available")
                self.camera_type = "picamera2"
            except ImportError:
                # Fallback to legacy picamera
                logger.info("✓ Camera (legacy picamera) available")
                self.camera_type = "picamera"

        except Exception as e:
            logger.warning(f"Camera initialization deferred: {e}")
            self.camera_type = None

    def start(self):
        """Start camera streaming"""
        try:
            if self.is_running:
                logger.warning("Camera stream already running")
                return

            # Start mjpg-streamer or similar
            if self.camera_type == "picamera2":
                self._start_picamera2()
            elif self.camera_type == "picamera":
                self._start_legacy_camera()
            else:
                logger.warning("No camera available")
                return

            self.is_running = True
            logger.info(f"✓ Camera stream started on port {self.port}")

        except Exception as e:
            logger.error(f"Failed to start camera: {e}")

    def _start_picamera2(self):
        """Start stream using picamera2"""
        try:
            import picamera2
            import libcamera

            camera = picamera2.Picamera2()

            # Configure preview
            config = camera.create_preview_configuration(
                main={"format": "MJPEG", "size": (self.width, self.height)}
            )
            camera.configure(config)
            camera.start()

            self.camera = camera
            logger.info("picamera2 stream configured")

        except Exception as e:
            logger.error(f"Failed to start picamera2: {e}")
            raise

    def _start_legacy_camera(self):
        """Start stream using legacy picamera"""
        try:
            import picamera

            camera = picamera.PiCamera()
            camera.resolution = (self.width, self.height)
            camera.framerate = self.fps

            # Start recording to HTTP endpoint
            # This is a placeholder - you'd need mjpg-streamer
            self.camera = camera
            logger.info("Legacy camera configured")

        except Exception as e:
            logger.error(f"Failed to start legacy camera: {e}")
            raise

    def stop(self):
        """Stop camera streaming"""
        try:
            self.is_running = False

            if hasattr(self, "camera"):
                if hasattr(self.camera, "stop"):
                    self.camera.stop()
                if hasattr(self.camera, "close"):
                    self.camera.close()

            if self.process:
                self.process.terminate()
                self.process.wait(timeout=5)

            logger.info("✓ Camera stream stopped")

        except Exception as e:
            logger.error(f"Error stopping camera: {e}")

    def pan(self, angle: int):
        """
        Pan camera left/right

        Args:
            angle: Degrees to pan (-90 to 90)
        """
        try:
            # Move servo
            self.pan_angle = max(-90, min(90, self.pan_angle + angle))
            self._set_servo(self.servo_left_pin, self.pan_angle)
            logger.debug(f"Pan to {self.pan_angle}°")

        except Exception as e:
            logger.error(f"Error panning camera: {e}")

    def tilt(self, angle: int):
        """
        Tilt camera up/down

        Args:
            angle: Degrees to tilt (-45 to 45)
        """
        try:
            # Move servo
            self.tilt_angle = max(-45, min(45, self.tilt_angle + angle))
            self._set_servo(self.servo_right_pin, self.tilt_angle)
            logger.debug(f"Tilt to {self.tilt_angle}°")

        except Exception as e:
            logger.error(f"Error tilting camera: {e}")

    def _set_servo(self, pin: int, angle: int):
        """
        Set servo position

        Args:
            pin: GPIO pin number
            angle: Position in degrees (-90 to 90)
        """
        try:
            import RPi.GPIO as GPIO

            if not self.pwm_left and not self.pwm_right:
                GPIO.setmode(GPIO.BCM)
                GPIO.setup([self.servo_left_pin, self.servo_right_pin], GPIO.OUT)

                self.pwm_left = GPIO.PWM(self.servo_left_pin, 50)  # 50Hz for servo
                self.pwm_right = GPIO.PWM(self.servo_right_pin, 50)

                self.pwm_left.start(0)
                self.pwm_right.start(0)

            # Convert angle to duty cycle
            # Typical servo: 1ms = -90°, 1.5ms = 0°, 2ms = 90°
            # At 50Hz, period is 20ms
            # Duty cycle = (pulse_width / period) * 100
            duty_cycle = 5 + (angle + 90) * 5 / 180  # 5-10% range

            if pin == self.servo_left_pin and self.pwm_left:
                self.pwm_left.ChangeDutyCycle(duty_cycle)
            elif pin == self.servo_right_pin and self.pwm_right:
                self.pwm_right.ChangeDutyCycle(duty_cycle)

        except Exception as e:
            logger.error(f"Error setting servo: {e}")

    def get_stream_url(self, host: str, port: int = None) -> str:
        """Get the camera stream URL"""
        if port is None:
            port = self.port
        return f"http://{host}:{port}/?action=stream"

    def take_snapshot(self, path: str):
        """Take a single snapshot"""
        try:
            if not hasattr(self, "camera"):
                logger.error("Camera not initialized")
                return

            self.camera.capture(path)
            logger.info(f"Snapshot saved to {path}")

        except Exception as e:
            logger.error(f"Error taking snapshot: {e}")

    def cleanup(self):
        """Clean up camera resources"""
        self.stop()

        try:
            if self.pwm_left:
                self.pwm_left.stop()
            if self.pwm_right:
                self.pwm_right.stop()

            import RPi.GPIO as GPIO
            GPIO.cleanup([self.servo_left_pin, self.servo_right_pin])

        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
