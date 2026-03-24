"""
Telemetry Collection Module
Gathers sensor data from various sources
"""

import logging
import os
import subprocess
from typing import Dict, Any

logger = logging.getLogger(__name__)


class TelemetryCollector:
    """Collects telemetry data from various sensors"""

    def __init__(self):
        self.mpu6050 = None
        self.battery_adc = None
        self.gps = None
        self._initialize_sensors()

    def _initialize_sensors(self):
        """Initialize available sensors"""
        try:
            from adafruit_mpu6050 import MPU6050
            import board
            i2c = board.I2C()
            self.mpu6050 = MPU6050(i2c)
            logger.info("✓ MPU6050 (Accelerometer) initialized")
        except Exception as e:
            logger.warning(f"MPU6050 not available: {e}")

        # ADC for battery monitoring
        try:
            from adafruit_ads1x15.analog_in import AnalogIn
            import adafruit_ads1x15.ads1115 as ADS
            import board
            i2c = board.I2C()
            ads = ADS.ADS1115(i2c)
            self.battery_adc = AnalogIn(ads, ADS.P0)
            logger.info("✓ ADS1115 ADC initialized")
        except Exception as e:
            logger.warning(f"ADC not available: {e}")

    def collect(self) -> Dict[str, Any]:
        """Collect all available telemetry data"""
        telemetry = {}

        # Battery
        battery_data = self._read_battery()
        if battery_data:
            telemetry['battery'] = battery_data

        # Temperature
        temp_data = self._read_temperature()
        if temp_data:
            telemetry['temperature'] = temp_data

        # Accelerometer
        accel_data = self._read_accelerometer()
        if accel_data:
            telemetry['accelerometer'] = accel_data

        # GPS (if available)
        # gps_data = self._read_gps()
        # if gps_data:
        #     telemetry['gps'] = gps_data

        return telemetry

    def _read_battery(self) -> Dict[str, Any] | None:
        """Read battery voltage and percentage"""
        try:
            # Using ADC
            if self.battery_adc:
                voltage = self.battery_adc.voltage
                # Assuming 12V battery measured through voltage divider
                actual_voltage = voltage * 3.0
                percentage = min(100, max(0, int((actual_voltage - 10) / 2 * 100)))

                return {
                    'voltage': round(actual_voltage, 2),
                    'percentage': percentage,
                    'charging': False,  # Would need additional logic to detect
                }

            # Fallback: read from system
            return self._read_system_battery()

        except Exception as e:
            logger.error(f"Error reading battery: {e}")
            return None

    def _read_system_battery(self) -> Dict[str, Any] | None:
        """Read battery info from /sys/class/power_supply"""
        try:
            # Try to read from UPS or battery
            battery_paths = [
                '/sys/class/power_supply/BAT0',
                '/sys/class/power_supply/battery',
            ]

            for path in battery_paths:
                if os.path.exists(path):
                    try:
                        with open(f'{path}/energy_now') as f:
                            energy_now = int(f.read().strip())
                        with open(f'{path}/energy_full') as f:
                            energy_full = int(f.read().strip())
                        with open(f'{path}/voltage_now') as f:
                            voltage = int(f.read().strip()) / 1_000_000

                        percentage = int((energy_now / energy_full) * 100)

                        return {
                            'voltage': round(voltage, 2),
                            'percentage': min(100, max(0, percentage)),
                            'charging': False,
                        }
                    except Exception:
                        continue

            return None

        except Exception as e:
            logger.error(f"Error reading system battery: {e}")
            return None

    def _read_temperature(self) -> Dict[str, Any] | None:
        """Read CPU and ambient temperature"""
        try:
            # CPU temperature
            cpu_temp = None
            try:
                with open('/sys/class/thermal/thermal_zone0/temp') as f:
                    cpu_temp = int(f.read().strip()) / 1000
            except FileNotFoundError:
                # Fallback for older systems
                result = subprocess.run(
                    ["vcgencmd", "measure_temp"],
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                if result.returncode == 0:
                    temp_str = result.stdout.split('=')[1].split("'")[0]
                    cpu_temp = float(temp_str)

            # Ambient temperature (if available from I2C sensor)
            ambient_temp = cpu_temp  # Default to CPU temp

            if cpu_temp is None:
                return None

            return {
                'cpu_temp': round(cpu_temp, 2),
                'ambient_temp': round(ambient_temp, 2),
                'unit': 'celsius',
            }

        except Exception as e:
            logger.error(f"Error reading temperature: {e}")
            return None

    def _read_accelerometer(self) -> Dict[str, Any] | None:
        """Read accelerometer and gyroscope data"""
        try:
            if not self.mpu6050:
                return None

            accel = self.mpu6050.acceleration
            gyro = self.mpu6050.gyro

            # Calculate pitch and roll from accelerometer
            import math
            accel_x, accel_y, accel_z = accel
            pitch = math.atan2(accel_y, math.sqrt(accel_x**2 + accel_z**2)) * 180 / math.pi
            roll = math.atan2(accel_x, math.sqrt(accel_y**2 + accel_z**2)) * 180 / math.pi

            gyro_x, gyro_y, gyro_z = gyro

            return {
                'acceleration': {
                    'x': round(accel_x, 3),
                    'y': round(accel_y, 3),
                    'z': round(accel_z, 3),
                },
                'gyroscope': {
                    'x': round(gyro_x, 3),
                    'y': round(gyro_y, 3),
                    'z': round(gyro_z, 3),
                },
                'pitch': round(pitch, 2),
                'roll': round(roll, 2),
                'unit': 'm/s² and rad/s',
            }

        except Exception as e:
            logger.error(f"Error reading accelerometer: {e}")
            return None

    def _read_gps(self) -> Dict[str, Any] | None:
        """Read GPS data (if available)"""
        try:
            # This would require a GPS module connected via serial
            # Placeholder for GPS implementation
            return None

        except Exception as e:
            logger.error(f"Error reading GPS: {e}")
            return None

    def cleanup(self):
        """Clean up sensor resources"""
        try:
            if self.mpu6050:
                # MPU6050 doesn't require explicit cleanup
                pass
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
