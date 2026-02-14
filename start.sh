#!/bin/bash

# Strategic Crisis Simulation - Start Script
# Usage: ./start.sh

echo "🎮 Strategic Crisis Simulation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found"
    echo ""
    echo "Create a .env file with:"
    echo "  ANTHROPIC_API_KEY=your-key-here"
    echo "  PORT=3000"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Kill any existing process on port 3000
echo "🔍 Checking for existing server on port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "🛑 Stopping existing server..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the server
echo "🚀 Starting server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Server running at: http://localhost:3000"
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start
