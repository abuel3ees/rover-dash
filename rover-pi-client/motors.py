"""
Motor Control Module
Handles movement and direction control
"""

import logging
import time
from typing import Dict

logger = logging.getLogger(__name__)


class MotorController:
    """Controls rover motors via GPIO"""

    def __init__(self, pins: Dict[str, int]):
        """
        Initialize motor controller with GPIO pins

        Args:
            pins: Dictionary with keys:
                - left_forward, left_backward, left_pwm
                - right_forward, right_backward, right_pwm
        """
        self.pins = pins
        self.current_speed = 0
        self.pwm_left = None
        self.pwm_right = None

        try:
            import RPi.GPIO as GPIO
            self.GPIO = GPIO
            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)

            # Setup pins
            for pin in [
                pins['left_forward'],
                pins['left_backward'],
                pins['right_forward'],
                pins['right_backward'],
            ]:
                GPIO.setup(pin, GPIO.OUT)
                GPIO.output(pin, GPIO.LOW)

            # Setup PWM for speed control
            self.pwm_left = GPIO.PWM(pins['left_pwm'], 1000)
            self.pwm_right = GPIO.PWM(pins['right_pwm'], 1000)

            self.pwm_left.start(0)
            self.pwm_right.start(0)

            logger.info("✓ Motor controller initialized")

        except Exception as e:
            logger.error(f"Failed to initialize GPIO: {e}")
            raise

    def move(self, direction: str, speed: int = 50):
        """
        Move the rover in a direction

        Args:
            direction: 'forward', 'backward', 'left', 'right'
            speed: Speed percentage (0-100)
        """
        try:
            speed = max(0, min(100, speed))  # Clamp speed
            self.current_speed = speed

            if direction == 'forward':
                self._move_forward(speed)
            elif direction == 'backward':
                self._move_backward(speed)
            elif direction == 'left':
                self._turn_left(speed)
            elif direction == 'right':
                self._turn_right(speed)
            else:
                logger.warning(f"Unknown direction: {direction}")
                self.stop()

            logger.debug(f"Moving {direction} at {speed}%")

        except Exception as e:
            logger.error(f"Error moving: {e}")
            self.stop()

    def rotate(self, direction: str, speed: int = 50):
        """
        Rotate the rover in place

        Args:
            direction: 'left' or 'right'
            speed: Rotation speed percentage (0-100)
        """
        try:
            speed = max(0, min(100, speed))
            self.current_speed = speed

            if direction == 'left':
                self._rotate_left(speed)
            elif direction == 'right':
                self._rotate_right(speed)
            else:
                logger.warning(f"Unknown rotation direction: {direction}")
                self.stop()

            logger.debug(f"Rotating {direction} at {speed}%")

        except Exception as e:
            logger.error(f"Error rotating: {e}")
            self.stop()

    def set_speed(self, speed: int):
        """Set current speed without changing direction"""
        speed = max(0, min(100, speed))
        self.current_speed = speed

        if self.pwm_left and self.pwm_right:
            self.pwm_left.ChangeDutyCycle(speed)
            self.pwm_right.ChangeDutyCycle(speed)

        logger.debug(f"Speed set to {speed}%")

    def stop(self):
        """Stop all motors immediately"""
        try:
            if not self.GPIO:
                return

            # Set all direction pins to LOW
            self.GPIO.output(self.pins['left_forward'], self.GPIO.LOW)
            self.GPIO.output(self.pins['left_backward'], self.GPIO.LOW)
            self.GPIO.output(self.pins['right_forward'], self.GPIO.LOW)
            self.GPIO.output(self.pins['right_backward'], self.GPIO.LOW)

            # Set PWM to 0
            if self.pwm_left:
                self.pwm_left.ChangeDutyCycle(0)
            if self.pwm_right:
                self.pwm_right.ChangeDutyCycle(0)

            self.current_speed = 0
            logger.debug("Motors stopped")

        except Exception as e:
            logger.error(f"Error stopping motors: {e}")

    # ─────────────────────────────────────────────────────────────────────
    # Private movement methods
    # ─────────────────────────────────────────────────────────────────────

    def _move_forward(self, speed: int):
        """Move forward"""
        if not self.GPIO:
            return

        # Set direction
        self.GPIO.output(self.pins['left_forward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['left_backward'], self.GPIO.LOW)
        self.GPIO.output(self.pins['right_forward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['right_backward'], self.GPIO.LOW)

        # Set speed
        if self.pwm_left and self.pwm_right:
            self.pwm_left.ChangeDutyCycle(speed)
            self.pwm_right.ChangeDutyCycle(speed)

    def _move_backward(self, speed: int):
        """Move backward"""
        if not self.GPIO:
            return

        # Set direction
        self.GPIO.output(self.pins['left_forward'], self.GPIO.LOW)
        self.GPIO.output(self.pins['left_backward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['right_forward'], self.GPIO.LOW)
        self.GPIO.output(self.pins['right_backward'], self.GPIO.HIGH)

        # Set speed
        if self.pwm_left and self.pwm_right:
            self.pwm_left.ChangeDutyCycle(speed)
            self.pwm_right.ChangeDutyCycle(speed)

    def _turn_left(self, speed: int):
        """Turn left (reduce left motor speed)"""
        if not self.GPIO:
            return

        # Set direction
        self.GPIO.output(self.pins['left_forward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['left_backward'], self.GPIO.LOW)
        self.GPIO.output(self.pins['right_forward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['right_backward'], self.GPIO.LOW)

        # Reduce left speed
        if self.pwm_left and self.pwm_right:
            self.pwm_left.ChangeDutyCycle(speed // 2)
            self.pwm_right.ChangeDutyCycle(speed)

    def _turn_right(self, speed: int):
        """Turn right (reduce right motor speed)"""
        if not self.GPIO:
            return

        # Set direction
        self.GPIO.output(self.pins['left_forward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['left_backward'], self.GPIO.LOW)
        self.GPIO.output(self.pins['right_forward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['right_backward'], self.GPIO.LOW)

        # Reduce right speed
        if self.pwm_left and self.pwm_right:
            self.pwm_left.ChangeDutyCycle(speed)
            self.pwm_right.ChangeDutyCycle(speed // 2)

    def _rotate_left(self, speed: int):
        """Rotate left in place"""
        if not self.GPIO:
            return

        # Left motor backward, right motor forward
        self.GPIO.output(self.pins['left_forward'], self.GPIO.LOW)
        self.GPIO.output(self.pins['left_backward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['right_forward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['right_backward'], self.GPIO.LOW)

        if self.pwm_left and self.pwm_right:
            self.pwm_left.ChangeDutyCycle(speed)
            self.pwm_right.ChangeDutyCycle(speed)

    def _rotate_right(self, speed: int):
        """Rotate right in place"""
        if not self.GPIO:
            return

        # Right motor backward, left motor forward
        self.GPIO.output(self.pins['left_forward'], self.GPIO.HIGH)
        self.GPIO.output(self.pins['left_backward'], self.GPIO.LOW)
        self.GPIO.output(self.pins['right_forward'], self.GPIO.LOW)
        self.GPIO.output(self.pins['right_backward'], self.GPIO.HIGH)

        if self.pwm_left and self.pwm_right:
            self.pwm_left.ChangeDutyCycle(speed)
            self.pwm_right.ChangeDutyCycle(speed)

    def cleanup(self):
        """Clean up GPIO resources"""
        try:
            if self.pwm_left:
                self.pwm_left.stop()
            if self.pwm_right:
                self.pwm_right.stop()

            if self.GPIO:
                self.GPIO.cleanup()

            logger.info("GPIO cleanup complete")

        except Exception as e:
            logger.error(f"Error during GPIO cleanup: {e}")
