#!/usr/bin/env python3
"""
Quick test to verify rover is configured correctly
Run on Pi: python3 rover-config-test.py
"""

import os
import sys
from pathlib import Path

CONFIG_DIR = Path.home() / 'rover' / 'rover-pi-client'
ENV_FILE = CONFIG_DIR / '.env'

print("=" * 70)
print("  ROVER CONFIGURATION TEST")
print("=" * 70)
print("")

# Check .env file
print("📁 Step 1: Check .env file")
if not ENV_FILE.exists():
    print(f"❌ .env file not found at: {ENV_FILE}")
    print("   Create it with:")
    print(f"   touch {ENV_FILE}")
    sys.exit(1)

print(f"✓ .env file found at: {ENV_FILE}")
print("")

# Load config
print("📋 Step 2: Load configuration")
config = {}
try:
    with open(ENV_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip().strip('"').strip("'")
    
    print(f"✓ Loaded {len(config)} config variables")
except Exception as e:
    print(f"❌ Error reading .env: {e}")
    sys.exit(1)

print("")

# Check required vars
print("🔑 Step 3: Check required variables")
required = ['DASHBOARD_URL', 'API_TOKEN', 'ROVER_ID', 'YOUTUBE_STREAM_KEY']
missing = []

for var in required:
    if var in config and config[var]:
        status = f"✓ {var}: {config[var][:20]}..." if len(config[var]) > 20 else f"✓ {var}: {config[var]}"
        print(status)
    else:
        print(f"⚠️  {var}: NOT SET")
        missing.append(var)

print("")

if missing:
    print(f"⚠️  Missing {len(missing)} configuration variables:")
    for var in missing:
        print(f"   - Add to .env: {var}='value_here'")
    print("")

# Test network
print("🌐 Step 4: Test network connectivity")
import requests
try:
    dashboard_url = config.get('DASHBOARD_URL', '')
    if dashboard_url:
        response = requests.get(dashboard_url, timeout=5)
        print(f"✓ Dashboard reachable: {response.status_code}")
    else:
        print("⚠️  DASHBOARD_URL not set, skipping")
except requests.ConnectionError:
    print(f"❌ Cannot connect to dashboard: {dashboard_url}")
    print("   Check DASHBOARD_URL and network connection")
except Exception as e:
    print(f"⚠️  Network test error: {e}")

print("")

# Test Python packages
print("📦 Step 5: Check Python packages")
packages = {
    'flask': 'Flask web framework',
    'picamera2': 'Camera library',
    'cv2': 'OpenCV',
    'requests': 'HTTP library'
}

for pkg, desc in packages.items():
    try:
        __import__(pkg)
        print(f"✓ {pkg}: {desc}")
    except ImportError:
        print(f"❌ {pkg}: NOT INSTALLED - {desc}")

print("")
print("=" * 70)
if missing:
    print("⚠️  Configuration incomplete - set missing variables before starting")
else:
    print("✅ Configuration OK - ready to start rover-master.py")
print("=" * 70)
