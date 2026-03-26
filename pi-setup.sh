#!/bin/bash
# Quick setup script for Pi telemetry client
# Run this on your Raspberry Pi to set everything up

set -e

echo "🤖 Rover Pi Telemetry Client - Quick Setup"
echo "=========================================="

# Create directory
mkdir -p /home/hamzamira/rover/rover-pi-client
cd /home/hamzamira/rover/rover-pi-client

# Download script
echo "📥 Downloading telemetry script..."
wget -q https://raw.githubusercontent.com/your-repo/rover-dashboard/main/pi-telemetry-client.py -O pi-telemetry-client.py
chmod +x pi-telemetry-client.py

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -q requests

# Create config
echo ""
echo "⚙️  Creating configuration file..."
python3 pi-telemetry-client.py

echo ""
echo "📝 Configuration file created at: config.json"
echo ""
echo "NEXT STEPS:"
echo "1. Edit config.json with your dashboard URL and API token"
echo "2. Test the script: python3 pi-telemetry-client.py"
echo "3. Add to crontab: crontab -e"
echo "   Add: * * * * * cd /home/hamzamira/rover/rover-pi-client && python3 pi-telemetry-client.py"
echo ""
echo "✅ Setup complete!"
