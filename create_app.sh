#!/bin/bash

# This script creates a macOS .app bundle that you can double-click
# Run this once: ./create_app.sh

APP_NAME="Crisis Simulation.app"
APP_DIR="$APP_NAME/Contents/MacOS"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Creating macOS application..."

# Create app bundle structure
mkdir -p "$APP_DIR"

# Create the launcher script
cat > "$APP_DIR/launcher" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/../../.."
./start.sh
EOF

chmod +x "$APP_DIR/launcher"

# Create Info.plist
cat > "$APP_NAME/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleName</key>
    <string>Crisis Simulation</string>
    <key>CFBundleDisplayName</key>
    <string>Crisis Simulation Server</string>
    <key>CFBundleIdentifier</key>
    <string>com.crisis-sim.server</string>
    <key>CFBundleVersion</key>
    <string>2.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
</dict>
</plist>
EOF

echo "✅ Created '$APP_NAME'"
echo ""
echo "You can now double-click '$APP_NAME' to start the server!"
