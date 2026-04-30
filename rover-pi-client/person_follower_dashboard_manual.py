#!/usr/bin/env python3
"""
PERSON FOLLOWER ROVER + DASHBOARD MANUAL OVERRIDE

This keeps the original person-following logic intact, and adds a dashboard
polling thread that can temporarily take over the Arduino serial commands.

Dashboard commands supported:
- manual_override {}
- auto_follow {}
- move {direction: forward|backward|left|right, speed: 0-100}
- rotate {direction: clockwise|counterclockwise, speed: 0-100}
- speed {speed: 0-100}
- stop {}
- ping/custom test commands

Arduino movement serial commands:
- FORWARD            -> F
- BACKWARD           -> B  (Arduino must support this for reverse movement)
- STOP               -> S
- ROTATE_LEFT_LOW    -> Q
- ROTATE_LEFT_MED    -> W
- ROTATE_LEFT_HIGH   -> E
- ROTATE_RIGHT_LOW   -> I
- ROTATE_RIGHT_MED   -> O
- ROTATE_RIGHT_HIGH  -> P

Arduino indicator serial commands:
- FREE   -> A
- LOCKED -> K
- LOST   -> X
- UNLOCK -> U
"""

import json
import math
import os
import subprocess
import socket
import shutil
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import cv2
import mediapipe as mp
import requests
import serial
from ultralytics import YOLO

# ---------------- DASHBOARD CONFIG ----------------
CONFIG_DIR = Path.home() / "rover" / "rover-pi-client"
ENV_FILE = CONFIG_DIR / ".env"

def read_env_file(path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    try:
        if not path.exists():
            return values

        with open(path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue

                key, value = line.split("=", 1)
                values[key.strip()] = value.strip().strip('"').strip("'")
    except Exception as e:
        print(f"[DASHBOARD] Failed to read {path}: {e}")

    return values


ENV_VALUES = read_env_file(ENV_FILE)


def config_value(key: str, default: Any = "") -> str:
    return str(os.getenv(key, ENV_VALUES.get(key, default)))


def config_float(key: str, default: Any) -> float:
    try:
        return float(config_value(key, default))
    except (TypeError, ValueError):
        return float(default)


def config_int(key: str, default: Any) -> int:
    try:
        return int(float(config_value(key, default)))
    except (TypeError, ValueError):
        return int(default)


def config_bool(key: str, default: Any) -> bool:
    value = config_value(key, default).strip().lower()
    return value not in ("0", "false", "no", "off")


DASHBOARD_URL = config_value("DASHBOARD_URL", "").rstrip("/")
API_TOKEN = config_value("API_TOKEN", config_value("ROVER_TOKEN", ""))
ROVER_ID = config_value("ROVER_ID", "")

COMMAND_POLL_INTERVAL = config_float("COMMAND_POLL_INTERVAL", 0.25)
DASHBOARD_REQUEST_TIMEOUT = config_float("DASHBOARD_REQUEST_TIMEOUT", 2.0)
HEARTBEAT_INTERVAL = config_float("HEARTBEAT_INTERVAL", 10.0)
TELEMETRY_INTERVAL = config_float("TELEMETRY_INTERVAL", 60.0)
MANUAL_MOVE_HOLD_SECONDS = config_float("MANUAL_MOVE_HOLD_SECONDS", 0.6)
MANUAL_STOP_HOLD_SECONDS = config_float("MANUAL_STOP_HOLD_SECONDS", 0.25)

STREAM_URL = config_value("STREAM_URL", "").strip()
STREAM_ENABLED = config_bool("STREAM_ENABLED", "true")
STREAM_MODE = config_value("STREAM_MODE", "relay").strip().lower()
STREAM_PUBLIC_URL = config_value("STREAM_PUBLIC_URL", "").strip()
ROVER_IP = config_value("ROVER_IP", config_value("PI_IP", "")).strip()
STREAM_PORT = config_value("STREAM_PORT", "8081").strip()
STREAM_PATH = config_value("STREAM_PATH", "/video").strip() or "/video"
PUBLIC_STREAM_URL = STREAM_PUBLIC_URL


def derive_public_stream_url() -> Optional[str]:
    public_url = STREAM_PUBLIC_URL.strip()
    if public_url:
        return public_url

    explicit = STREAM_URL.strip()
    if explicit.startswith(("http://", "https://")):
        return explicit

    if ROVER_IP:
        host = ROVER_IP.replace("http://", "").replace("https://", "").rstrip("/")
        port = STREAM_PORT or "8081"
        path = STREAM_PATH if STREAM_PATH.startswith("/") else f"/{STREAM_PATH}"
        return f"http://{host}:{port}{path}"

    return None


def get_local_ip() -> str:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except Exception:
        return ROVER_IP or ""

# ---------------- ORIGINAL FOLLOWER CONFIG ----------------
SERIAL_PORT = "/dev/ttyACM0"
SERIAL_BAUD = 115200

last_send_time = 0.0
SEND_REPEAT_INTERVAL = 0.12

MODEL_PATH = config_value("MODEL_PATH", "yolov8n.pt")
CAM_INDEX = config_int("CAM_INDEX", 10)
CAMERA_FALLBACKS = (0, 1, 2)

LOST_TIMEOUT = 5.0
SMOOTHING_FACTOR = 0.20
DEADZONE_WIDTH = 0.15
MAX_CAMERA_FAILS = 20

LOCK_HOLD_SECONDS = 0.20
UNLOCK_HOLD_SECONDS = 1.2

PERSON_CONF = config_float("PERSON_CONF", 0.22)
YOLO_IMGSZ = config_int("YOLO_IMGSZ", 288)
YOLO_MAX_DET = config_int("YOLO_MAX_DET", 4)
TRACKER_CONFIG = config_value("TRACKER_CONFIG", "bytetrack.yaml")
HAND_PROCESS_SCALE = config_float("HAND_PROCESS_SCALE", 0.35)
MAX_HANDS = config_int("MAX_HANDS", 1)

FRAME_W = config_int("FRAME_W", 480)
FRAME_H = config_int("FRAME_H", 270)
CAMERA_FPS = config_int("CAMERA_FPS", 60)
CAMERA_READ_THROTTLE_FPS = config_float("CAMERA_READ_THROTTLE_FPS", 0)
CAMERA_THREADED = config_bool("CAMERA_THREADED", "true")
CAMERA_READ_TIMEOUT = config_float("CAMERA_READ_TIMEOUT", 1.0)

# --- FPS optimization ---
TRACK_EVERY_N_FRAMES_FREE = config_int("TRACK_EVERY_N_FRAMES_FREE", 3)
TRACK_EVERY_N_FRAMES_LOCKED = config_int("TRACK_EVERY_N_FRAMES_LOCKED", 2)
HANDS_EVERY_N_FRAMES_FREE = config_int("HANDS_EVERY_N_FRAMES_FREE", 3)
HANDS_EVERY_N_FRAMES_LOCKED = config_int("HANDS_EVERY_N_FRAMES_LOCKED", 4)

# --- Distance control uses YOLO person height only ---
STOP_HEIGHT_THRESHOLD = 190
FORWARD_HEIGHT_THRESHOLD = 235
HEIGHT_SMOOTH_ALPHA = 0.18

# --- Person visibility requirements ---
MIN_PERSON_HEIGHT_PX = 40
MIN_VISIBLE_HEIGHT_FRAC = 0.75
MIN_VISIBLE_AREA_FRAC = 0.65

# --- Peace-sign lock requirements ---
PEACE_MIN_PERSON_HEIGHT_PX = 35

# --- Lock box style / center point ---
BOX_SIDE_RATIO = 0.42
BOX_CENTER_Y_RATIO = 0.38

# --- Pulsed rotation tuning ---
ROTATE_PULSE_TIME_FAR = 0.002
ROTATE_PULSE_TIME_MID = 0.040
ROTATE_PULSE_TIME_CLOSE = 0.300

# Height range used for pulse scaling.
ROTATE_HEIGHT_FAR = 150
ROTATE_HEIGHT_CLOSE = 230

ROTATE_SETTLE_TIME = 0.500

# --- Unlocked target scoring ---
CENTER_PREFERENCE_WEIGHT = 0.65
SIZE_PREFERENCE_WEIGHT = 0.35

# --- Gesture ownership regions ---
LOCK_HAND_REGION_FRAC = 0.80
UNLOCK_HAND_REGION_FRAC = 0.60

# --- Stability / grace settings ---
POST_LOCK_STABLE_FRAMES = 3
TARGET_INVALID_GRACE_TIME = 0.40

# --- Console debug ---
PRINT_INTERVAL = 0.25

# ---------------- GLOBALS ----------------
cap = None
ser = None
last_sent = None
last_action = "STOP"

# Indicator serial state
last_indicator_sent = None
unlock_indicator_until = 0.0

# Dashboard manual override state
dashboard_session = requests.Session()
stream_session = requests.Session()
telemetry_session = requests.Session()
shutdown_event = threading.Event()
serial_lock = threading.Lock()
manual_lock = threading.Lock()
manual_mode_enabled = False
manual_override_until = 0.0
manual_active_cmd: Optional[str] = None
manual_speed = 50
manual_last_command_id = None

# Camera frame relay state — Pi pushes JPEG frames out to the dashboard
latest_frame_lock = threading.Lock()
latest_stream_frame = None
latest_stream_frame_seq = 0
latest_stream_jpeg: Optional[bytes] = None
latest_stream_jpeg_seq = -1
last_stream_frame_capture_time = 0.0
STREAM_PUBLISH_FPS = config_float("STREAM_PUBLISH_FPS", 0)
STREAM_CAPTURE_FPS = config_float("STREAM_CAPTURE_FPS", STREAM_PUBLISH_FPS)
STREAM_CONNECT_TIMEOUT = config_float("STREAM_CONNECT_TIMEOUT", 1.0)
STREAM_READ_TIMEOUT = config_float("STREAM_READ_TIMEOUT", 2.0)
STREAM_JPEG_QUALITY = config_int("STREAM_JPEG_QUALITY", 55)
STREAM_FRAME_WIDTH = config_int("STREAM_FRAME_WIDTH", FRAME_W)
STREAM_FRAME_HEIGHT = config_int("STREAM_FRAME_HEIGHT", 0)
STREAM_RESEND_STALE_FRAMES = config_bool("STREAM_RESEND_STALE_FRAMES", "true")
STREAM_FAILURE_BACKOFF = config_float("STREAM_FAILURE_BACKOFF", 0.25)

HLS_OUTPUT_DIR = Path(config_value("HLS_OUTPUT_DIR", "/tmp/rover-hls"))
HLS_PLAYLIST_NAME = config_value("HLS_PLAYLIST_NAME", "stream.m3u8")
HLS_PUBLIC_URL = config_value("HLS_PUBLIC_URL", "").strip()
HLS_FPS = config_float("HLS_FPS", 24)
HLS_SEGMENT_SECONDS = config_float("HLS_SEGMENT_SECONDS", 1.0)
HLS_LIST_SIZE = config_int("HLS_LIST_SIZE", 6)
HLS_BITRATE = config_value("HLS_BITRATE", "2200k")
HLS_ENCODER = config_value("HLS_ENCODER", "libx264")
HLS_UPLOAD_POLL_INTERVAL = config_float("HLS_UPLOAD_POLL_INTERVAL", 0.15)

# Runtime performance stats
loop_fps_ewma = 0.0
last_loop_time = 0.0

# HLS stream state
latest_hls_frame_lock = threading.Lock()
latest_hls_frame = None
latest_hls_frame_seq = 0
last_hls_frame_time = 0.0
hls_upload_state: Dict[str, Tuple[float, int]] = {}

# ---------------- MODELS ----------------
cv2.setUseOptimized(True)
try:
    cv2.setNumThreads(config_int("OPENCV_THREADS", 1))
except Exception:
    pass

try:
    import torch

    torch.set_num_threads(config_int("TORCH_THREADS", 2))
except Exception:
    pass

model = YOLO(MODEL_PATH)
try:
    model.fuse()
except Exception:
    pass

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    max_num_hands=MAX_HANDS,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6,
)

# ---------------- STATE ----------------
FREE, LOCKED, LOST, DISABLED = "FREE", "LOCKED", "LOST", "DISABLED"
state = FREE

target_track_id = None
lost_timer = None
smooth_tx = None
smooth_height = None
camera_fail_count = 0

peace_hold_start = None
peace_candidate_track = None
open_palm_hold_start = None

frame_count = 0
cached_person_boxes = {}
cached_hand_results = None

target_stable_count = 0
target_invalid_since = None

pulse_active = False
pulse_cmd = None
pulse_start_time = 0.0
pulse_duration = 0.0
settle_until = 0.0

last_print_time = 0.0


# ---------------- DASHBOARD HELPERS ----------------
def load_dashboard_config():
    """Load dashboard config from ~/rover/rover-pi-client/.env."""
    global DASHBOARD_URL, API_TOKEN, ROVER_ID
    global STREAM_URL, STREAM_ENABLED, STREAM_MODE, STREAM_PUBLIC_URL, PUBLIC_STREAM_URL, ROVER_IP, STREAM_PORT

    DASHBOARD_URL = config_value("DASHBOARD_URL", DASHBOARD_URL).rstrip("/")
    API_TOKEN = config_value("API_TOKEN", config_value("ROVER_TOKEN", API_TOKEN))
    ROVER_ID = config_value("ROVER_ID", ROVER_ID)
    STREAM_URL = config_value("STREAM_URL", STREAM_URL).strip()
    STREAM_MODE = config_value("STREAM_MODE", STREAM_MODE).strip().lower()
    STREAM_PUBLIC_URL = config_value("STREAM_PUBLIC_URL", STREAM_PUBLIC_URL).strip()
    PUBLIC_STREAM_URL = STREAM_PUBLIC_URL
    ROVER_IP = config_value("ROVER_IP", config_value("PI_IP", ROVER_IP)).strip()
    STREAM_PORT = config_value("STREAM_PORT", STREAM_PORT).strip()
    STREAM_ENABLED = config_bool("STREAM_ENABLED", STREAM_ENABLED)

    if DASHBOARD_URL and API_TOKEN and ROVER_ID:
        print(f"[DASHBOARD] Config loaded: {DASHBOARD_URL}, rover {ROVER_ID}")
    else:
        print("[DASHBOARD] Missing DASHBOARD_URL/API_TOKEN/ROVER_ID; manual dashboard control disabled.")

    if hls_stream_enabled():
        print(f"[STREAM] HLS upload mode enabled: {HLS_PUBLIC_URL or dashboard_public_url('/rover/hls/' + HLS_PLAYLIST_NAME)}")
    elif frame_relay_enabled():
        print(f"[STREAM] Dashboard frame relay enabled: {DASHBOARD_URL}/api/rover/frame")
    elif STREAM_MODE == "direct":
        print(f"[STREAM] Direct stream mode enabled: {derive_public_stream_url() or '(missing STREAM_URL)'}")
    else:
        print("[STREAM] Stream publishing disabled.")


def dashboard_configured():
    return bool(DASHBOARD_URL and API_TOKEN and ROVER_ID)


def frame_relay_enabled() -> bool:
    return STREAM_ENABLED and STREAM_MODE not in ("direct", "hls", "off", "false", "none")


def hls_stream_enabled() -> bool:
    return STREAM_ENABLED and STREAM_MODE == "hls"


def dashboard_api_url(path: str) -> str:
    base = DASHBOARD_URL.rstrip("/")
    if base.endswith("/api"):
        return f"{base}{path}"
    return f"{base}/api{path}"


def dashboard_public_url(path: str) -> str:
    base = DASHBOARD_URL.rstrip("/")
    if base.endswith("/api"):
        base = base[:-4]
    return f"{base}{path}"


def dashboard_headers(content_type=False):
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "X-Rover-Id": ROVER_ID,
        "Accept": "application/json",
    }
    if content_type:
        headers["Content-Type"] = "application/json"
    return headers


def send_heartbeat():
    try:
        response = dashboard_session.post(
            dashboard_api_url("/rover/heartbeat"),
            json={},
            headers=dashboard_headers(content_type=True),
            timeout=DASHBOARD_REQUEST_TIMEOUT,
        )
        if response.status_code not in (200, 201):
            print(f"[DASHBOARD] Heartbeat failed: {response.status_code}")
    except Exception as e:
        print(f"[DASHBOARD] Heartbeat error: {e}")


def fetch_pending_commands():
    try:
        response = dashboard_session.get(
            dashboard_api_url("/rover/commands/pending"),
            headers=dashboard_headers(),
            timeout=DASHBOARD_REQUEST_TIMEOUT,
        )
        if response.status_code == 200:
            return response.json().get("commands", [])

        print(f"[DASHBOARD] Command fetch failed: {response.status_code} {response.text[:160]}")
    except Exception as e:
        print(f"[DASHBOARD] Command fetch error: {e}")

    return []


def mark_command_complete(cmd_id, status, message):
    if cmd_id is None:
        return

    try:
        payload = {
            "status": status,
            "response": message if isinstance(message, str) else json.dumps(message),
        }
        response = dashboard_session.post(
            dashboard_api_url(f"/rover/commands/{cmd_id}/complete"),
            json=payload,
            headers=dashboard_headers(content_type=True),
            timeout=DASHBOARD_REQUEST_TIMEOUT,
        )
        if response.status_code not in (200, 201):
            print(f"[DASHBOARD] Complete failed for command {cmd_id}: {response.status_code} {response.text[:160]}")
    except Exception as e:
        print(f"[DASHBOARD] Complete error for command {cmd_id}: {e}")


def update_stream_url(stream_url: str) -> bool:
    if not dashboard_configured() or not stream_url:
        return False

    try:
        response = dashboard_session.patch(
            dashboard_api_url("/rover/settings"),
            json={"stream_url": stream_url},
            headers=dashboard_headers(content_type=True),
            timeout=DASHBOARD_REQUEST_TIMEOUT,
        )
        if response.status_code in (200, 201):
            print(f"[DASHBOARD] Stream URL updated: {stream_url}")
            return True

        print(f"[DASHBOARD] Stream URL update failed: {response.status_code} {response.text[:160]}")
    except Exception as e:
        print(f"[DASHBOARD] Stream URL update error: {e}")

    return False


def update_rover_network_info(stream_url: str, ip_address: str, stream_port: int) -> bool:
    if not dashboard_configured():
        return False

    payload = {
        "stream_url": stream_url,
        "ip_address": ip_address,
        "stream_port": stream_port,
    }

    try:
        response = dashboard_session.patch(
            dashboard_api_url("/rover/settings"),
            json=payload,
            headers=dashboard_headers(content_type=True),
            timeout=DASHBOARD_REQUEST_TIMEOUT,
        )
        if response.status_code in (200, 201):
            print(f"[DASHBOARD] Network info updated: {ip_address}:{stream_port} -> {stream_url}")
            return True

        print(f"[DASHBOARD] Network info update failed: {response.status_code} {response.text[:160]}")
    except Exception as e:
        print(f"[DASHBOARD] Network info update error: {e}")

    return False


def read_sysfs(path: Path, default: str = "0") -> str:
    try:
        if path.exists():
            return path.read_text().strip()
    except Exception:
        pass
    return default


def get_temperature_data() -> Dict[str, Any]:
    temp_data: Dict[str, Any] = {}

    try:
        thermal_file = Path("/sys/class/thermal/thermal_zone0/temp")
        if thermal_file.exists():
            temp_data["cpu_temp"] = round(int(thermal_file.read_text().strip()) / 1000, 2)
    except Exception:
        pass

    if "cpu_temp" not in temp_data:
        try:
            result = subprocess.run(
                ["vcgencmd", "measure_temp"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                temp_str = result.stdout.split("=")[1].replace("'C", "").strip()
                temp_data["cpu_temp"] = float(temp_str)
        except Exception:
            pass

    try:
        with open("/proc/loadavg", "r") as f:
            load_avg = float(f.read().split()[0])
            temp_data["motor_temp"] = round(35 + (load_avg * 5), 2)
    except Exception:
        temp_data["motor_temp"] = 40

    if "cpu_temp" not in temp_data:
        temp_data["cpu_temp"] = 45

    if "ambient_temp" not in temp_data:
        temp_data["ambient_temp"] = temp_data.get("motor_temp", temp_data["cpu_temp"])

    return temp_data


def get_battery_data() -> Dict[str, Any]:
    battery_info: Dict[str, Any] = {}
    power_supply_path = Path("/sys/class/power_supply")

    try:
        if power_supply_path.exists():
            for battery_dir in power_supply_path.iterdir():
                if not battery_dir.name.startswith("BAT"):
                    continue

                capacity_file = battery_dir / "capacity"
                voltage_file = battery_dir / "voltage_now"
                current_file = battery_dir / "current_now"

                try:
                    battery_info["percentage"] = int(read_sysfs(capacity_file, "100"))
                except Exception:
                    battery_info["percentage"] = 100

                try:
                    voltage_uv = int(read_sysfs(voltage_file, "0"))
                    battery_info["voltage"] = round(voltage_uv / 1000000, 2)
                except Exception:
                    battery_info["voltage"] = 12.0

                try:
                    current_ua = int(read_sysfs(current_file, "0"))
                    battery_info["current"] = round(current_ua / 1000000, 2)
                except Exception:
                    battery_info["current"] = 2.5

                battery_info["charging"] = read_sysfs(battery_dir / "status", "Unknown") == "Charging"
                break
    except Exception:
        pass

    if not battery_info:
        battery_info = {
            "percentage": 85,
            "voltage": 12.0,
            "current": 2.5,
            "charging": False,
        }

    return battery_info


def get_gps_data() -> Dict[str, Any]:
    try:
        import socket

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        try:
            sock.connect(("localhost", 2947))
            sock.send(b'?WATCH={"enable":true,"json":true}\n')
            data = sock.recv(4096).decode(errors="ignore")

            for line in data.splitlines():
                if '"class":"TPV"' not in line:
                    continue
                report = json.loads(line)
                return {
                    "latitude": report.get("lat", 0),
                    "longitude": report.get("lon", 0),
                    "altitude": report.get("alt", 0),
                    "speed": report.get("speed", 0),
                    "heading": report.get("track", 0),
                    "satellites": report.get("satellites", 0),
                    "accuracy": report.get("eph", 0),
                }
        finally:
            sock.close()
    except Exception:
        pass

    return {
        "latitude": 0,
        "longitude": 0,
        "altitude": 0,
        "speed": 0,
        "heading": 0,
        "satellites": 0,
        "accuracy": 0,
    }


def send_telemetry(telemetry_type: str, data: Dict[str, Any]) -> bool:
    if not dashboard_configured():
        return False

    try:
        payload = {
            "type": telemetry_type,
            "data": data,
            "recorded_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }
        response = telemetry_session.post(
            dashboard_api_url("/telemetry"),
            json=payload,
            headers=dashboard_headers(content_type=True),
            timeout=DASHBOARD_REQUEST_TIMEOUT,
        )
        if response.status_code in (200, 201):
            return True

        print(f"[DASHBOARD] Telemetry failed ({telemetry_type}): {response.status_code} {response.text[:160]}")
    except Exception as e:
        print(f"[DASHBOARD] Telemetry error ({telemetry_type}): {e}")

    return False


def collect_and_send_tracking_data():
    send_telemetry("gps", get_gps_data())
    send_telemetry("battery", get_battery_data())
    send_telemetry("temperature", get_temperature_data())


def speed_to_turn_command(side: str, speed: int) -> str:
    speed = clamp(int(speed), 0, 100)
    if side == "left":
        if speed <= 35:
            return "ROTATE_LEFT_LOW"
        if speed <= 70:
            return "ROTATE_LEFT_MED"
        return "ROTATE_LEFT_HIGH"

    if speed <= 35:
        return "ROTATE_RIGHT_LOW"
    if speed <= 70:
        return "ROTATE_RIGHT_MED"
    return "ROTATE_RIGHT_HIGH"


def manual_move_command(direction: str, speed: int) -> Optional[str]:
    direction = str(direction).lower()
    if direction == "forward":
        return "FORWARD"
    if direction == "backward":
        return "BACKWARD"
    if direction == "left":
        return speed_to_turn_command("left", speed)
    if direction == "right":
        return speed_to_turn_command("right", speed)
    return None


def reset_autonomous_state_for_manual():
    """Clear target-following state so manual control cannot fight a lock."""
    global state, target_track_id, lost_timer, smooth_tx, smooth_height
    global peace_hold_start, peace_candidate_track, open_palm_hold_start
    global target_stable_count, target_invalid_since
    global pulse_active, pulse_cmd, pulse_start_time, pulse_duration, settle_until
    global cached_hand_results, unlock_indicator_until

    state = FREE
    target_track_id = None
    lost_timer = None
    smooth_tx = None
    smooth_height = None
    peace_hold_start = None
    peace_candidate_track = None
    open_palm_hold_start = None
    target_stable_count = 0
    target_invalid_since = None
    pulse_active = False
    pulse_cmd = None
    pulse_start_time = 0.0
    pulse_duration = 0.0
    settle_until = 0.0
    cached_hand_results = None
    unlock_indicator_until = 0.0
    send_indicator("FREE")


def enter_manual_mode():
    """Latch manual mode and stop autonomous person following."""
    global manual_mode_enabled, manual_override_until, manual_active_cmd

    reset_autonomous_state_for_manual()

    with manual_lock:
        manual_mode_enabled = True
        manual_active_cmd = None
        manual_override_until = 0.0

    send_cmd("STOP")
    send_indicator("FREE")


def exit_manual_mode():
    """Return to automatic person following."""
    global manual_mode_enabled, manual_override_until, manual_active_cmd

    with manual_lock:
        manual_mode_enabled = False
        manual_active_cmd = None
        manual_override_until = 0.0

    reset_autonomous_state_for_manual()
    send_cmd("STOP")
    send_indicator("FREE")


def set_manual_override(cmd: Optional[str], hold_seconds: float):
    global manual_mode_enabled, manual_override_until, manual_active_cmd

    now = time.time()

    with manual_lock:
        already_manual = manual_mode_enabled

    if not already_manual:
        reset_autonomous_state_for_manual()

    with manual_lock:
        manual_mode_enabled = True
        manual_active_cmd = cmd
        manual_override_until = now + hold_seconds

    send_cmd(cmd or "STOP")


def clear_manual_override(stop=True):
    global manual_override_until, manual_active_cmd

    with manual_lock:
        manual_active_cmd = None
        manual_override_until = 0.0

    if stop:
        send_cmd("STOP")


def apply_manual_override(now: float) -> bool:
    global manual_override_until, manual_active_cmd

    expired = False
    active_cmd = None
    manual_enabled = False

    with manual_lock:
        manual_enabled = manual_mode_enabled
        if manual_enabled and manual_active_cmd is not None and now < manual_override_until:
            active_cmd = manual_active_cmd
        elif manual_enabled and manual_active_cmd is not None and now >= manual_override_until:
            manual_active_cmd = None
            manual_override_until = 0.0
            expired = True

    if not manual_enabled:
        return False

    if active_cmd is not None:
        send_cmd(active_cmd)
        return True

    if expired or manual_enabled:
        send_cmd("STOP")

    return True


def handle_dashboard_command(cmd: Dict[str, Any]):
    global manual_speed, manual_last_command_id

    cmd_id = cmd.get("id")
    cmd_type = cmd.get("type")
    payload = cmd.get("payload") or {}

    if cmd_id == manual_last_command_id:
        return
    manual_last_command_id = cmd_id

    print(f"[DASHBOARD] Command {cmd_id}: {cmd_type} {payload}")

    try:
        if cmd_type == "manual_override":
            enter_manual_mode()
            mark_command_complete(cmd_id, "executed", "Manual override enabled; autonomous following stopped")
            return

        if cmd_type == "auto_follow":
            exit_manual_mode()
            mark_command_complete(cmd_id, "executed", "Automatic person following enabled")
            return

        if cmd_type == "move":
            direction = payload.get("direction", "forward")
            speed = int(payload.get("speed", manual_speed))
            manual_speed = clamp(speed, 0, 100)

            manual_cmd = manual_move_command(direction, manual_speed)
            if manual_cmd is None:
                raise ValueError(f"Unsupported manual direction: {direction}")

            set_manual_override(manual_cmd, MANUAL_MOVE_HOLD_SECONDS)
            mark_command_complete(
                cmd_id,
                "executed",
                f"Manual override: {direction} at speed {manual_speed} -> {manual_cmd}",
            )
            return

        if cmd_type == "rotate":
            direction = str(payload.get("direction", "clockwise")).lower()
            speed = int(payload.get("speed", manual_speed))
            manual_speed = clamp(speed, 0, 100)

            if direction in ("clockwise", "right", "cw"):
                manual_cmd = speed_to_turn_command("right", manual_speed)
            elif direction in ("counterclockwise", "counter", "left", "ccw"):
                manual_cmd = speed_to_turn_command("left", manual_speed)
            else:
                raise ValueError(f"Unsupported rotate direction: {direction}")

            set_manual_override(manual_cmd, MANUAL_MOVE_HOLD_SECONDS)
            mark_command_complete(
                cmd_id,
                "executed",
                f"Manual rotate: {direction} at speed {manual_speed} -> {manual_cmd}",
            )
            return

        if cmd_type == "speed":
            manual_speed = clamp(int(payload.get("speed", manual_speed)), 0, 100)
            mark_command_complete(cmd_id, "executed", f"Manual speed set to {manual_speed}")
            return

        if cmd_type == "stop":
            enter_manual_mode()
            clear_manual_override(stop=True)
            mark_command_complete(cmd_id, "executed", "Manual stop sent to Arduino")
            return

        # Backward compatibility with older command names.
        legacy_map = {
            "move_forward": "forward",
            "move_backward": "backward",
            "turn_left": "left",
            "turn_right": "right",
        }
        if cmd_type in legacy_map:
            direction = legacy_map[cmd_type]
            manual_cmd = manual_move_command(direction, manual_speed)
            set_manual_override(manual_cmd, MANUAL_MOVE_HOLD_SECONDS)
            mark_command_complete(cmd_id, "executed", f"Legacy manual command: {cmd_type} -> {manual_cmd}")
            return

        if cmd_type in ("ping", "custom"):
            mark_command_complete(cmd_id, "executed", "Rover dashboard command polling is alive")
            return

        if cmd_type == "camera":
            mark_command_complete(cmd_id, "executed", "Camera command received; no pan/tilt serial mapping configured")
            return

        raise ValueError(f"Unsupported command type: {cmd_type}")

    except Exception as e:
        print(f"[DASHBOARD] Command {cmd_id} failed: {e}")
        mark_command_complete(cmd_id, "failed", str(e))


def dashboard_poll_loop():
    if not dashboard_configured():
        return

    last_heartbeat_time = 0.0

    while not shutdown_event.is_set():
        now = time.time()

        commands = fetch_pending_commands()
        for cmd in commands:
            handle_dashboard_command(cmd)

        if now - last_heartbeat_time >= HEARTBEAT_INTERVAL:
            send_heartbeat()
            last_heartbeat_time = now

        shutdown_event.wait(COMMAND_POLL_INTERVAL)


def dashboard_telemetry_loop():
    if not dashboard_configured():
        return

    while not shutdown_event.is_set():
        collect_and_send_tracking_data()
        shutdown_event.wait(TELEMETRY_INTERVAL)


# ---------------- ORIGINAL HELPERS ----------------
def open_serial():
    global ser
    candidate_ports = [
        SERIAL_PORT,
        "/dev/ttyACM0",
        "/dev/ttyACM1",
        "/dev/ttyUSB0",
        "/dev/ttyUSB1",
    ]
    for port in candidate_ports:
        try:
            ser = serial.Serial(port, SERIAL_BAUD, timeout=1)
            time.sleep(2.5)
            print(f"[SERIAL] Connected to {port}")
            return
        except Exception:
            pass
    ser = None
    print("[SERIAL] No Arduino serial port found. Running without serial.")


def send_cmd(cmd: Optional[str]):
    global last_sent, ser, last_send_time, last_action

    mapping = {
        "FORWARD": "F",
        "BACKWARD": "B",
        "STOP": "S",
        "ROTATE_LEFT_LOW": "Q",
        "ROTATE_LEFT_MED": "W",
        "ROTATE_LEFT_HIGH": "E",
        "ROTATE_RIGHT_LOW": "I",
        "ROTATE_RIGHT_MED": "O",
        "ROTATE_RIGHT_HIGH": "P",
    }

    if cmd not in mapping:
        return

    now = time.time()
    should_send = (cmd != last_sent) or ((now - last_send_time) >= SEND_REPEAT_INTERVAL)

    last_action = cmd

    if not should_send:
        return

    last_sent = cmd
    last_send_time = now

    if ser is None:
        return

    try:
        with serial_lock:
            ser.write(mapping[cmd].encode())
    except Exception:
        pass


def send_indicator(indicator: str):
    """
    Sends state-only commands to Arduino for LED/buzzer.
    This is separate from movement commands, so it does not affect rover motion.
    """
    global last_indicator_sent, ser

    mapping = {
        "FREE": "A",
        "LOCKED": "K",
        "LOST": "X",
        "UNLOCK": "U",
    }

    if indicator not in mapping:
        return

    # Avoid spamming the Arduino with the same state every frame
    if indicator == last_indicator_sent:
        return

    last_indicator_sent = indicator

    if ser is None:
        return

    try:
        with serial_lock:
            ser.write(mapping[indicator].encode())
    except Exception:
        pass


def update_indicator_state(now):
    """
    Keeps Arduino LED/buzzer matched to the current Raspberry Pi state.
    UNLOCK is held briefly so Arduino has time to show the red unlock flash.
    """
    global unlock_indicator_until

    if now < unlock_indicator_until:
        send_indicator("UNLOCK")
        return

    if state == FREE:
        send_indicator("FREE")
    elif state == LOCKED:
        send_indicator("LOCKED")
    elif state == LOST:
        send_indicator("LOST")
    elif state == DISABLED:
        send_indicator("UNLOCK")


def clamp(value, low, high):
    return max(low, min(high, value))


def get_height_based_rotate_pulse(height_px):
    """
    Returns rotation pulse duration based on smoothed YOLO person height.

    Far target  -> shorter pulse
    Close target -> longer pulse

    This is intentionally bounded to prevent dangerous over-rotation.
    """
    if height_px is None:
        return ROTATE_PULSE_TIME_MID

    height_px = clamp(height_px, ROTATE_HEIGHT_FAR, ROTATE_HEIGHT_CLOSE)

    ratio = (height_px - ROTATE_HEIGHT_FAR) / float(ROTATE_HEIGHT_CLOSE - ROTATE_HEIGHT_FAR)
    ratio = clamp(ratio, 0.0, 1.0)

    pulse = ROTATE_PULSE_TIME_FAR + ratio * (ROTATE_PULSE_TIME_CLOSE - ROTATE_PULSE_TIME_FAR)

    return clamp(pulse, ROTATE_PULSE_TIME_FAR, ROTATE_PULSE_TIME_CLOSE)


def is_peace(hand_lms):
    lm = hand_lms.landmark
    index_up = lm[8].y < lm[6].y
    middle_up = lm[12].y < lm[10].y
    ring_down = lm[16].y > lm[14].y
    pinky_down = lm[20].y > lm[18].y
    spacing = abs(lm[8].x - lm[12].x)
    return index_up and middle_up and ring_down and pinky_down and spacing > 0.02


def is_open_palm(hand_lms):
    lm = hand_lms.landmark
    index_up = lm[8].y < lm[6].y
    middle_up = lm[12].y < lm[10].y
    ring_up = lm[16].y < lm[14].y
    pinky_up = lm[20].y < lm[18].y
    return sum([index_up, middle_up, ring_up, pinky_up]) >= 3


def get_hand_center(hand_lms, w, h):
    xs = [int(p.x * w) for p in hand_lms.landmark]
    ys = [int(p.y * h) for p in hand_lms.landmark]
    return sum(xs) // len(xs), sum(ys) // len(ys)


def xyxy_center(box):
    x1, y1, x2, y2 = box
    return ((x1 + x2) // 2, (y1 + y2) // 2)


def point_in_box(px, py, box):
    x1, y1, x2, y2 = box
    return x1 <= px <= x2 and y1 <= py <= y2


def get_upper_region(box, frac):
    x1, y1, x2, y2 = box
    upper_y2 = y1 + int((y2 - y1) * frac)
    return (x1, y1, x2, upper_y2)


def process_hands_fast(frame):
    if HAND_PROCESS_SCALE == 1.0:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    else:
        small_frame = cv2.resize(
            frame, (0, 0),
            fx=HAND_PROCESS_SCALE, fy=HAND_PROCESS_SCALE,
            interpolation=cv2.INTER_LINEAR,
        )
        rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    rgb_frame.flags.writeable = False
    return hands.process(rgb_frame)


def get_intersection_ratio(boxA, boxB):
    xA, yA = max(boxA[0], boxB[0]), max(boxA[1], boxB[1])
    xB, yB = min(boxA[2], boxB[2]), min(boxA[3], boxB[3])
    inter_area = max(0, xB - xA) * max(0, yB - yA)
    target_area = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    return inter_area / float(target_area) if target_area > 0 else 0


def body_visible_enough(person_box, frame_w, frame_h):
    x1, y1, x2, y2 = person_box
    pw = max(1, x2 - x1)
    ph = max(1, y2 - y1)

    visible_x1 = max(0, x1)
    visible_y1 = max(0, y1)
    visible_x2 = min(frame_w - 1, x2)
    visible_y2 = min(frame_h - 1, y2)

    visible_w = max(0, visible_x2 - visible_x1)
    visible_h = max(0, visible_y2 - visible_y1)

    visible_area_frac = (visible_w * visible_h) / float(pw * ph)
    visible_height_frac = visible_h / float(ph)

    return (
        ph >= MIN_PERSON_HEIGHT_PX
        and visible_height_frac >= MIN_VISIBLE_HEIGHT_FRAC
        and visible_area_frac >= MIN_VISIBLE_AREA_FRAC
    )


def build_body_ratio_box(person_box):
    x1, y1, x2, y2 = person_box
    ph = max(1, y2 - y1)
    cx = (x1 + x2) // 2
    cy = int(y1 + ph * BOX_CENTER_Y_RATIO)
    side = int(ph * BOX_SIDE_RATIO)
    half = side // 2
    return (cx - half, cy - half, cx + half, cy + half)


def score_person_candidate(person_box, frame_w, frame_h):
    x1, y1, x2, y2 = person_box
    pw = max(1, x2 - x1)
    ph = max(1, y2 - y1)
    cx = (x1 + x2) / 2.0

    center_dist = abs(cx - (frame_w / 2.0)) / (frame_w / 2.0)
    center_score = 1.0 - min(1.0, center_dist)

    size_score = min(1.0, ph / float(frame_h * 0.85))
    area_score = min(1.0, (pw * ph) / float(frame_w * frame_h * 0.35))

    return (CENTER_PREFERENCE_WEIGHT * center_score) + (SIZE_PREFERENCE_WEIGHT * max(size_score, area_score))


def select_best_unlocked_person(person_boxes, frame_w, frame_h):
    best_tid = None
    best_score = -1.0

    for tid, pbox in person_boxes.items():
        if not body_visible_enough(pbox, frame_w, frame_h):
            continue

        score = score_person_candidate(pbox, frame_w, frame_h)
        if score > best_score:
            best_score = score
            best_tid = tid

    return best_tid


def person_is_close_enough_for_peace_lock(person_box):
    x1, y1, x2, y2 = person_box
    ph = max(1, y2 - y1)
    return ph >= PEACE_MIN_PERSON_HEIGHT_PX


def find_person_for_hand_strict(px, py, person_boxes, upper_frac):
    best_tid = None
    best_dist = None

    for tid, box in person_boxes.items():
        region = get_upper_region(box, upper_frac)
        if not point_in_box(px, py, region):
            continue

        cx, cy = xyxy_center(region)
        dist = ((px - cx) ** 2 + (py - cy) ** 2) ** 0.5

        if best_dist is None or dist < best_dist:
            best_dist = dist
            best_tid = tid

    return best_tid


def open_camera():
    camera_indexes = [CAM_INDEX] + [idx for idx in CAMERA_FALLBACKS if idx != CAM_INDEX]
    for camera_index in camera_indexes:
        cam = cv2.VideoCapture(camera_index, cv2.CAP_V4L2)
        cam.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_W)
        cam.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_H)
        cam.set(cv2.CAP_PROP_FPS, CAMERA_FPS)
        cam.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
        cam.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        if cam.isOpened():
            print(f"[CAMERA] Opened camera index {camera_index}")
            return cam

        cam.release()

    raise RuntimeError(f"Failed to open camera. Tried indexes: {camera_indexes}")


class LatestFrameCamera:
    """Continuously drains the camera and exposes only the freshest frame."""

    def __init__(self, capture):
        self.capture = capture
        self.lock = threading.Lock()
        self.frame = None
        self.seq = 0
        self.fail_count = 0
        self.thread = threading.Thread(target=self._read_loop, daemon=True)

    def start(self):
        self.thread.start()
        print("[CAMERA] Latest-frame reader started.")

    def _read_loop(self):
        min_interval = 1.0 / CAMERA_READ_THROTTLE_FPS if CAMERA_READ_THROTTLE_FPS > 0 else 0.0

        while not shutdown_event.is_set():
            read_started = time.time()
            ret, frame = self.capture.read()

            if ret and frame is not None:
                with self.lock:
                    self.frame = frame
                    self.seq += 1
                    self.fail_count = 0
                update_latest_frame(frame)
                update_latest_hls_frame(frame)
            else:
                with self.lock:
                    self.fail_count += 1
                shutdown_event.wait(0.02)

            elapsed = time.time() - read_started
            delay = max(0.0, min_interval - elapsed)
            if delay > 0:
                shutdown_event.wait(delay)

    def read(self, last_seq=None, timeout=CAMERA_READ_TIMEOUT):
        deadline = time.time() + max(0.0, timeout)

        while not shutdown_event.is_set():
            with self.lock:
                if self.frame is not None and self.seq != last_seq:
                    return True, self.frame.copy(), self.seq

            if time.time() >= deadline:
                return False, None, last_seq

            shutdown_event.wait(0.005)


def get_turn_command_by_section(tx, frame_w, deadzone_width):
    center_x = frame_w / 2.0
    left_deadzone = center_x - (frame_w * deadzone_width)
    right_deadzone = center_x + (frame_w * deadzone_width)

    if left_deadzone <= tx <= right_deadzone:
        return None

    if tx < left_deadzone:
        left_span = max(1.0, left_deadzone - 0.0)
        section = left_span / 3.0

        left_near_start = left_deadzone - section
        left_mid_start = left_deadzone - (2.0 * section)

        if tx >= left_near_start:
            return "ROTATE_LEFT_LOW"
        elif tx >= left_mid_start:
            return "ROTATE_LEFT_MED"
        else:
            return "ROTATE_LEFT_HIGH"

    if tx > right_deadzone:
        right_span = max(1.0, frame_w - right_deadzone)
        section = right_span / 3.0

        right_near_end = right_deadzone + section
        right_mid_end = right_deadzone + (2.0 * section)

        if tx <= right_near_end:
            return "ROTATE_RIGHT_LOW"
        elif tx <= right_mid_end:
            return "ROTATE_RIGHT_MED"
        else:
            return "ROTATE_RIGHT_HIGH"

    return None


def print_status(now):
    global last_print_time
    if (now - last_print_time) < PRINT_INTERVAL:
        return
    last_print_time = now

    height_txt = "None" if smooth_height is None else str(int(smooth_height))
    target_txt = "None" if target_track_id is None else str(target_track_id)
    pulse_txt = f"{pulse_duration:.3f}s" if pulse_duration > 0 else "0.000s"
    fps_txt = f"{loop_fps_ewma:.1f}" if loop_fps_ewma > 0 else "0.0"

    with manual_lock:
        mode_txt = "MANUAL" if manual_mode_enabled else "AUTO"
        manual_txt = "ON" if manual_active_cmd is not None and now < manual_override_until else "IDLE"

    print(
        f"[STATE] {state} | "
        f"Mode: {mode_txt} | "
        f"Manual: {manual_txt} | "
        f"Target: {target_txt} | "
        f"Height: {height_txt} | "
        f"Action: {last_action} | "
        f"FPS: {fps_txt} | "
        f"Pulse: {pulse_txt} | "
        f"Stable: {target_stable_count}/{POST_LOCK_STABLE_FRAMES}"
    )


# ---------------- DASHBOARD FRAME RELAY ----------------

def update_latest_frame(frame):
    """Store a lightweight frame snapshot for the publisher thread."""
    global latest_stream_frame, latest_stream_frame_seq, last_stream_frame_capture_time

    if not (frame_relay_enabled() and dashboard_configured()):
        return

    now = time.time()
    if STREAM_CAPTURE_FPS > 0:
        min_interval = 1.0 / STREAM_CAPTURE_FPS
    else:
        min_interval = 0.0

    if min_interval > 0 and (now - last_stream_frame_capture_time) < min_interval:
        return

    last_stream_frame_capture_time = now
    with latest_frame_lock:
        latest_stream_frame = frame.copy()
        latest_stream_frame_seq += 1


def encode_stream_frame(frame) -> Optional[bytes]:
    output = frame

    if STREAM_FRAME_WIDTH > 0 and output.shape[1] > STREAM_FRAME_WIDTH:
        ratio = STREAM_FRAME_WIDTH / float(output.shape[1])
        target_h = STREAM_FRAME_HEIGHT if STREAM_FRAME_HEIGHT > 0 else int(output.shape[0] * ratio)
        output = cv2.resize(output, (STREAM_FRAME_WIDTH, target_h), interpolation=cv2.INTER_AREA)
    elif STREAM_FRAME_HEIGHT > 0 and output.shape[0] > STREAM_FRAME_HEIGHT:
        ratio = STREAM_FRAME_HEIGHT / float(output.shape[0])
        target_w = int(output.shape[1] * ratio)
        output = cv2.resize(output, (target_w, STREAM_FRAME_HEIGHT), interpolation=cv2.INTER_AREA)

    quality = int(clamp(STREAM_JPEG_QUALITY, 20, 95))
    success, encoded = cv2.imencode(".jpg", output, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not success:
        return None

    return encoded.tobytes()


def stream_publish_loop():
    """Continuously POST the latest JPEG frame to the dashboard relay endpoint.

    Outbound-only — works through NAT without ngrok or port forwarding. The
    dashboard caches the latest frame and serves it to browsers as MJPEG via
    /rover/stream.
    """
    global latest_stream_jpeg, latest_stream_jpeg_seq

    interval = 1.0 / STREAM_PUBLISH_FPS if STREAM_PUBLISH_FPS > 0 else 0.0
    last_logged_failure = 0.0
    last_logged_success = 0.0
    consecutive_failures = 0
    last_published_seq = -1

    while not shutdown_event.is_set():
        if not (frame_relay_enabled() and dashboard_configured()):
            shutdown_event.wait(2.0)
            continue

        with latest_frame_lock:
            frame = latest_stream_frame
            frame_seq = latest_stream_frame_seq
            cached_jpeg = latest_stream_jpeg if latest_stream_jpeg_seq == latest_stream_frame_seq else None

        if frame is None:
            shutdown_event.wait(0.005)
            continue

        if frame_seq == last_published_seq and not STREAM_RESEND_STALE_FRAMES:
            shutdown_event.wait(0.005)
            continue

        frame_bytes = cached_jpeg if cached_jpeg is not None else encode_stream_frame(frame)
        if frame_bytes is None:
            shutdown_event.wait(0.005)
            continue

        if cached_jpeg is None:
            with latest_frame_lock:
                latest_stream_jpeg = frame_bytes
                latest_stream_jpeg_seq = frame_seq

        last_published_seq = frame_seq
        upload_started = time.time()
        try:
            response = stream_session.post(
                dashboard_api_url("/rover/frame"),
                data=frame_bytes,
                headers={
                    "Authorization": f"Bearer {API_TOKEN}",
                    "X-Rover-Id": ROVER_ID,
                    "Content-Type": "image/jpeg",
                    "Accept": "application/json",
                    "Connection": "keep-alive",
                },
                timeout=(STREAM_CONNECT_TIMEOUT, STREAM_READ_TIMEOUT),
            )
            elapsed = time.time() - upload_started
            if response.status_code in (200, 201, 204):
                consecutive_failures = 0
                if time.time() - last_logged_success > 30:
                    print(f"[STREAM] Frame uploaded ({len(frame_bytes)} B in {elapsed*1000:.0f} ms)")
                    last_logged_success = time.time()
            else:
                consecutive_failures += 1
                if time.time() - last_logged_failure > 5:
                    print(f"[STREAM] Frame upload failed: {response.status_code} {response.text[:160]}")
                    last_logged_failure = time.time()
        except requests.exceptions.ReadTimeout:
            consecutive_failures += 1
            if time.time() - last_logged_failure > 5:
                print(
                    f"[STREAM] Read timeout after {STREAM_READ_TIMEOUT}s — "
                    f"upstream too slow. Lower STREAM_PUBLISH_FPS or move off ngrok-free."
                )
                last_logged_failure = time.time()
        except Exception as e:
            consecutive_failures += 1
            if time.time() - last_logged_failure > 5:
                print(f"[STREAM] Frame upload error: {e}")
                last_logged_failure = time.time()

        # With STREAM_PUBLISH_FPS=0, there is no artificial cap: the next
        # upload starts as soon as the previous POST finishes.
        elapsed = time.time() - upload_started
        delay = max(0.0, interval - elapsed) if interval > 0 else 0.0
        if consecutive_failures >= 5:
            delay = max(delay, STREAM_FAILURE_BACKOFF)
        if delay > 0:
            shutdown_event.wait(delay)


def start_stream_publisher():
    if not frame_relay_enabled():
        print("[STREAM] Dashboard frame relay publisher disabled.")
        return

    threading.Thread(target=stream_publish_loop, daemon=True).start()
    if STREAM_PUBLISH_FPS > 0:
        print(f"[STREAM] Frame publisher started (target ~{STREAM_PUBLISH_FPS:.0f} fps to dashboard).")
    else:
        print("[STREAM] Frame publisher started (uncapped best-effort to dashboard).")


# ---------------- HLS VIDEO STREAM ----------------

def update_latest_hls_frame(frame):
    """Store the latest camera frame for the FFmpeg HLS encoder."""
    global latest_hls_frame, latest_hls_frame_seq, last_hls_frame_time

    if not hls_stream_enabled():
        return

    now = time.time()
    if HLS_FPS > 0:
        min_interval = 1.0 / HLS_FPS
        if (now - last_hls_frame_time) < min_interval:
            return

    last_hls_frame_time = now
    with latest_hls_frame_lock:
        latest_hls_frame = frame.copy()
        latest_hls_frame_seq += 1


def get_latest_hls_frame(timeout: float = 5.0):
    deadline = time.time() + timeout

    while not shutdown_event.is_set():
        with latest_hls_frame_lock:
            if latest_hls_frame is not None:
                return latest_hls_frame.copy()

        if time.time() >= deadline:
            return None

        shutdown_event.wait(0.02)


def build_hls_ffmpeg_command(width: int, height: int) -> list[str]:
    fps = max(1, int(HLS_FPS))
    segment_seconds = max(0.5, HLS_SEGMENT_SECONDS)
    gop = max(1, int(fps * segment_seconds))
    playlist_path = str(HLS_OUTPUT_DIR / HLS_PLAYLIST_NAME)
    segment_path = str(HLS_OUTPUT_DIR / "segment_%06d.ts")

    return [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "warning",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "bgr24",
        "-s",
        f"{width}x{height}",
        "-r",
        str(fps),
        "-i",
        "pipe:0",
        "-an",
        "-c:v",
        HLS_ENCODER,
        "-preset",
        "ultrafast",
        "-tune",
        "zerolatency",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        HLS_BITRATE,
        "-maxrate",
        HLS_BITRATE,
        "-bufsize",
        HLS_BITRATE,
        "-g",
        str(gop),
        "-keyint_min",
        str(gop),
        "-sc_threshold",
        "0",
        "-f",
        "hls",
        "-hls_time",
        str(segment_seconds),
        "-hls_list_size",
        str(max(3, HLS_LIST_SIZE)),
        "-hls_flags",
        "delete_segments+omit_endlist+independent_segments",
        "-hls_segment_filename",
        segment_path,
        playlist_path,
    ]


def hls_encode_loop():
    if not hls_stream_enabled():
        return

    if shutil.which("ffmpeg") is None:
        print("[HLS] ffmpeg not found; HLS streaming disabled.")
        return

    first_frame = get_latest_hls_frame()
    if first_frame is None:
        print("[HLS] No camera frame available for HLS encoder.")
        return

    HLS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for stale_file in HLS_OUTPUT_DIR.glob("*"):
        if stale_file.is_file():
            try:
                stale_file.unlink()
            except Exception:
                pass

    height, width = first_frame.shape[:2]
    cmd = build_hls_ffmpeg_command(width, height)

    try:
        process = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    except Exception as e:
        print(f"[HLS] Failed to start ffmpeg: {e}")
        return

    print(f"[HLS] Encoder started ({width}x{height} @ ~{max(1, int(HLS_FPS))} fps, {HLS_BITRATE}).")
    frame_interval = 1.0 / max(1.0, HLS_FPS)
    next_frame_at = time.time()

    while not shutdown_event.is_set() and process.poll() is None:
        frame = get_latest_hls_frame(timeout=1.0)
        if frame is None:
            continue

        if frame.shape[1] != width or frame.shape[0] != height:
            frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)

        try:
            process.stdin.write(frame.tobytes())
        except Exception as e:
            print(f"[HLS] ffmpeg stdin error: {e}")
            break

        next_frame_at += frame_interval
        delay = max(0.0, next_frame_at - time.time())
        if delay > 0:
            shutdown_event.wait(delay)
        elif delay < -1.0:
            next_frame_at = time.time()

    try:
        if process.stdin:
            process.stdin.close()
    except Exception:
        pass

    try:
        process.terminate()
    except Exception:
        pass

    print("[HLS] Encoder stopped.")


def upload_hls_file(path: Path) -> bool:
    try:
        data = path.read_bytes()
    except Exception:
        return False

    try:
        response = stream_session.post(
            dashboard_api_url(f"/rover/hls/{path.name}"),
            data=data,
            headers={
                "Authorization": f"Bearer {API_TOKEN}",
                "X-Rover-Id": ROVER_ID,
                "Content-Type": "application/vnd.apple.mpegurl" if path.suffix == ".m3u8" else "video/mp2t",
                "Accept": "application/json",
                "Connection": "keep-alive",
            },
            timeout=(STREAM_CONNECT_TIMEOUT, STREAM_READ_TIMEOUT),
        )
        return response.status_code in (200, 201, 204)
    except Exception as e:
        print(f"[HLS] Upload error for {path.name}: {e}")
        return False


def hls_upload_loop():
    if not (hls_stream_enabled() and dashboard_configured()):
        return

    last_logged = 0.0

    while not shutdown_event.is_set():
        files = sorted(
            [path for path in HLS_OUTPUT_DIR.glob("*") if path.suffix in (".ts", ".m3u8", ".m4s", ".mp4")],
            key=lambda path: (path.suffix == ".m3u8", path.name),
        )

        uploaded = 0
        for path in files:
            try:
                stat = path.stat()
            except Exception:
                continue

            marker = (stat.st_mtime, stat.st_size)
            if hls_upload_state.get(path.name) == marker:
                continue

            if upload_hls_file(path):
                hls_upload_state[path.name] = marker
                uploaded += 1

        if uploaded and time.time() - last_logged > 10:
            print(f"[HLS] Uploaded {uploaded} changed HLS file(s) to dashboard.")
            last_logged = time.time()

        shutdown_event.wait(HLS_UPLOAD_POLL_INTERVAL)


def start_hls_publisher():
    if not hls_stream_enabled():
        return

    if not dashboard_configured():
        print("[HLS] Dashboard not configured; HLS publisher disabled.")
        return

    threading.Thread(target=hls_encode_loop, daemon=True).start()
    threading.Thread(target=hls_upload_loop, daemon=True).start()
    print("[HLS] HLS encoder/uploader threads started.")


# ---------------- STARTUP ----------------
load_dashboard_config()
open_serial()
cap = open_camera()
camera_reader = None
if CAMERA_THREADED:
    camera_reader = LatestFrameCamera(cap)
    camera_reader.start()
send_indicator("FREE")
start_stream_publisher()
start_hls_publisher()

local_ip = get_local_ip()
if local_ip:
    ROVER_IP = local_ip

direct_stream_url = derive_public_stream_url() if STREAM_MODE == "direct" else None
hls_stream_url = (
    HLS_PUBLIC_URL or dashboard_public_url(f"/rover/hls/{HLS_PLAYLIST_NAME}")
) if hls_stream_enabled() else None
dashboard_stream_url = (
    direct_stream_url
    or hls_stream_url
    or ("relay://dashboard" if frame_relay_enabled() else "")
)

if dashboard_configured() and dashboard_stream_url:
    update_rover_network_info(
        dashboard_stream_url,
        local_ip or ROVER_IP or "",
        int(STREAM_PORT or "8081"),
    )

dashboard_thread = threading.Thread(target=dashboard_poll_loop, daemon=True)
dashboard_thread.start()
telemetry_thread = threading.Thread(target=dashboard_telemetry_loop, daemon=True)
telemetry_thread.start()
if dashboard_configured():
    print("[DASHBOARD] Command polling and telemetry threads started.")


# ---------------- MAIN LOOP ----------------
last_camera_seq = None
try:
    while True:
        if camera_reader is not None:
            ret, frame, last_camera_seq = camera_reader.read(last_camera_seq)
        else:
            ret, frame = cap.read()

        if not ret or frame is None:
            camera_fail_count += 1
            if camera_fail_count >= MAX_CAMERA_FAILS:
                print("[CAMERA] Too many failures, stopping.")
                break
            continue

        camera_fail_count = 0
        now = time.time()
        h, w = frame.shape[:2]
        frame_count += 1
        if last_loop_time > 0:
            loop_dt = max(0.001, now - last_loop_time)
            instant_fps = 1.0 / loop_dt
            loop_fps_ewma = instant_fps if loop_fps_ewma <= 0 else (
                (0.90 * loop_fps_ewma) + (0.10 * instant_fps)
            )
        last_loop_time = now
        if camera_reader is None:
            update_latest_frame(frame)
            update_latest_hls_frame(frame)

        if apply_manual_override(now):
            update_indicator_state(now)
            print_status(now)
            continue

        # ---------- PERSON TRACKING ----------
        if state == FREE:
            run_track_now = ((frame_count % TRACK_EVERY_N_FRAMES_FREE) == 0)
        else:
            run_track_now = ((frame_count % TRACK_EVERY_N_FRAMES_LOCKED) == 0)

        if run_track_now:
            person_boxes = {}
            result = model.track(
                frame,
                persist=True,
                classes=[0],
                conf=PERSON_CONF,
                imgsz=YOLO_IMGSZ,
                max_det=YOLO_MAX_DET,
                tracker=TRACKER_CONFIG,
                verbose=False,
            )[0]

            boxes = result.boxes
            if boxes is not None and boxes.xyxy is not None and boxes.id is not None:
                xyxy = boxes.xyxy.cpu().numpy().astype(int)
                ids = boxes.id.cpu().numpy().astype(int)
                for tid, box in zip(ids, xyxy):
                    person_boxes[int(tid)] = (box[0], box[1], box[2], box[3])

            cached_person_boxes = person_boxes
        else:
            person_boxes = cached_person_boxes.copy()

        best_free_person_tid = None
        if state == FREE:
            best_free_person_tid = select_best_unlocked_person(person_boxes, w, h)

        # ---------- GESTURES ----------
        if state == FREE and len(person_boxes) > 0:
            run_hands_now = ((frame_count % HANDS_EVERY_N_FRAMES_FREE) == 0)
        elif state == LOCKED and target_track_id in person_boxes:
            run_hands_now = ((frame_count % HANDS_EVERY_N_FRAMES_LOCKED) == 0)
        else:
            run_hands_now = False

        if run_hands_now:
            cached_hand_results = process_hands_fast(frame)

        hand_results = cached_hand_results if state in (FREE, LOCKED) else None

        frame_peace_candidate_track = None
        frame_has_target_open_palm = False

        if hand_results is not None and hand_results.multi_hand_landmarks:
            for hand_lms in hand_results.multi_hand_landmarks:
                hx, hy = get_hand_center(hand_lms, w, h)

                if state == FREE and is_peace(hand_lms):
                    candidate_tid = find_person_for_hand_strict(
                        hx, hy, person_boxes, LOCK_HAND_REGION_FRAC
                    )

                    if candidate_tid is not None and candidate_tid in person_boxes:
                        if (
                            body_visible_enough(person_boxes[candidate_tid], w, h)
                            and person_is_close_enough_for_peace_lock(person_boxes[candidate_tid])
                        ):
                            frame_peace_candidate_track = candidate_tid

                if state == LOCKED and is_open_palm(hand_lms) and target_track_id is not None:
                    matched_tid = find_person_for_hand_strict(
                        hx, hy, person_boxes, UNLOCK_HAND_REGION_FRAC
                    )
                    if matched_tid == target_track_id:
                        frame_has_target_open_palm = True

        # ---------- STATE MACHINE ----------
        if state == FREE:
            smooth_height = None

            if frame_peace_candidate_track is not None:
                if peace_candidate_track != frame_peace_candidate_track:
                    peace_candidate_track = frame_peace_candidate_track
                    peace_hold_start = now
                elif peace_hold_start is not None and (now - peace_hold_start) >= LOCK_HOLD_SECONDS:
                    target_track_id = peace_candidate_track
                    state = LOCKED
                    send_indicator("LOCKED")

                    lost_timer = None
                    smooth_tx = None
                    open_palm_hold_start = None
                    smooth_height = None
                    target_stable_count = 0
                    target_invalid_since = None
                    pulse_active = False
                    pulse_cmd = None
                    pulse_duration = 0.0
                    settle_until = 0.0
                    send_cmd("STOP")
            else:
                peace_candidate_track = None
                peace_hold_start = None

        if state == LOCKED and target_track_id is not None:
            if frame_has_target_open_palm:
                open_palm_hold_start = now if open_palm_hold_start is None else open_palm_hold_start
                if (now - open_palm_hold_start) >= UNLOCK_HOLD_SECONDS:
                    state = DISABLED
                    unlock_indicator_until = now + 1.5
                    send_indicator("UNLOCK")

                    target_track_id = None
                    open_palm_hold_start = None
                    target_stable_count = 0
                    target_invalid_since = None
                    pulse_active = False
                    pulse_cmd = None
                    pulse_duration = 0.0
                    settle_until = 0.0
                    send_cmd("STOP")
            else:
                open_palm_hold_start = None

        # ---------- FOLLOW LOGIC ----------
        if state == LOCKED:
            target_valid = (
                target_track_id in person_boxes
                and body_visible_enough(person_boxes[target_track_id], w, h)
            )

            if target_valid:
                target_invalid_since = None
                target_stable_count += 1
                lost_timer = None

                target_person_box = person_boxes[target_track_id]
                x1, y1, x2, y2 = target_person_box
                person_height = max(1, y2 - y1)

                smooth_height = person_height if smooth_height is None else (
                    (HEIGHT_SMOOTH_ALPHA * person_height) + ((1 - HEIGHT_SMOOTH_ALPHA) * smooth_height)
                )

                lock_box = build_body_ratio_box(target_person_box)
                control_tx, _ = xyxy_center(lock_box)

                if target_stable_count < POST_LOCK_STABLE_FRAMES:
                    send_cmd("STOP")
                    pulse_active = False
                    pulse_cmd = None
                    pulse_duration = 0.0
                    settle_until = 0.0
                else:
                    collision = False
                    for tid, pbox in person_boxes.items():
                        if tid != target_track_id and body_visible_enough(pbox, w, h):
                            if get_intersection_ratio(target_person_box, pbox) >= 0.40:
                                collision = True
                                break

                    if collision:
                        send_cmd("STOP")
                        pulse_active = False
                        pulse_cmd = None
                        pulse_duration = 0.0
                        settle_until = 0.0
                    else:
                        smooth_tx = control_tx if smooth_tx is None else (
                            (SMOOTHING_FACTOR * control_tx) + ((1 - SMOOTHING_FACTOR) * smooth_tx)
                        )

                        turn_cmd = get_turn_command_by_section(smooth_tx, w, DEADZONE_WIDTH)
                        now_t = time.time()

                        if turn_cmd is None:
                            pulse_active = False
                            pulse_cmd = None
                            pulse_duration = 0.0
                            settle_until = 0.0

                            if smooth_height is not None and smooth_height >= STOP_HEIGHT_THRESHOLD:
                                send_cmd("STOP")
                            elif smooth_height is not None and smooth_height < FORWARD_HEIGHT_THRESHOLD:
                                send_cmd("FORWARD")
                            else:
                                send_cmd("STOP")
                        else:
                            if now_t < settle_until:
                                send_cmd("STOP")
                            elif pulse_active:
                                if (now_t - pulse_start_time) < pulse_duration:
                                    send_cmd(pulse_cmd)
                                else:
                                    send_cmd("STOP")
                                    pulse_active = False
                                    pulse_cmd = None
                                    pulse_duration = 0.0
                                    settle_until = now_t + ROTATE_SETTLE_TIME
                            else:
                                pulse_active = True
                                pulse_cmd = turn_cmd
                                pulse_start_time = now_t

                                # Rotation pulse duration depends on smoothed target height.
                                pulse_duration = get_height_based_rotate_pulse(smooth_height)

                                send_cmd(turn_cmd)

            else:
                if target_invalid_since is None:
                    target_invalid_since = now

                send_cmd("STOP")
                pulse_active = False
                pulse_cmd = None
                pulse_duration = 0.0
                settle_until = 0.0

                if (now - target_invalid_since) >= TARGET_INVALID_GRACE_TIME:
                    if lost_timer is None:
                        lost_timer = now
                    state = LOST
                    send_indicator("LOST")
                    target_stable_count = 0

        elif state == LOST:
            send_cmd("STOP")
            pulse_active = False
            pulse_cmd = None
            pulse_duration = 0.0
            settle_until = 0.0

            if target_track_id in person_boxes and body_visible_enough(person_boxes[target_track_id], w, h):
                state = LOCKED
                send_indicator("LOCKED")

                lost_timer = None
                smooth_tx = None
                open_palm_hold_start = None
                target_stable_count = 0
                target_invalid_since = None
            elif lost_timer is not None and now - lost_timer > LOST_TIMEOUT:
                state = FREE
                send_indicator("FREE")

                target_track_id = None
                open_palm_hold_start = None
                target_stable_count = 0
                target_invalid_since = None
                send_cmd("STOP")

        elif state == DISABLED:
            send_cmd("STOP")
            pulse_active = False
            pulse_cmd = None
            pulse_duration = 0.0
            settle_until = 0.0

            # Stay in UNLOCK indicator briefly, then return to FREE.
            if now >= unlock_indicator_until:
                state = FREE
                send_indicator("FREE")
                peace_candidate_track = None
                peace_hold_start = None
                open_palm_hold_start = None
                target_stable_count = 0
                target_invalid_since = None

        update_indicator_state(now)
        print_status(now)

except KeyboardInterrupt:
    print("\n[EXIT] Stopped by user.")

finally:
    shutdown_event.set()

    try:
        clear_manual_override(stop=True)
        send_indicator("FREE")
    except Exception:
        pass

    try:
        if cap is not None:
            cap.release()
    except Exception:
        pass

    try:
        if ser is not None:
            ser.close()
    except Exception:
        pass

    try:
        hands.close()
    except Exception:
        pass

    print("[CLEANUP] Done.")
