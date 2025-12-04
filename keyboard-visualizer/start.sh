#!/bin/bash
# Keyboard Visualizer Launcher
# Auto-detects available HTTP server and launches the visualizer

set -e

PORT=8000
# Get the keyboard-visualizer directory
VISUALIZER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Go up one level to serve from project root (so config/ is accessible)
DIR="$(cd "$VISUALIZER_DIR/.." && pwd)"

echo "============================================================"
echo "🎹 Detun Keyboard Visualizer Launcher"
echo "============================================================"
echo ""

cd "$DIR"

# Function to check if port is available
is_port_available() {
    ! lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Find available port
while ! is_port_available $PORT; do
    echo "⚠️  Port $PORT is in use, trying $((PORT+1))..."
    PORT=$((PORT+1))
    if [ $PORT -gt 8010 ]; then
        echo "❌ Could not find available port"
        exit 1
    fi
done

URL="http://localhost:$PORT"

echo "📁 Directory: $DIR"
echo "🌐 URL: $URL"
echo ""

# Detect and use available HTTP server
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3 HTTP server"
    echo "🚀 Starting server..."
    echo ""
    echo "Press Ctrl+C to stop"
    echo "============================================================"
    echo ""

    # Open browser after a short delay (open keyboard-visualizer subdirectory)
    (sleep 2 && open "$URL/keyboard-visualizer/" 2>/dev/null || xdg-open "$URL/keyboard-visualizer/" 2>/dev/null || echo "Please open $URL/keyboard-visualizer/ in your browser") &

    python3 -m http.server $PORT

elif command -v python &> /dev/null; then
    echo "✅ Using Python 2 HTTP server"
    echo "🚀 Starting server..."
    echo ""
    echo "Press Ctrl+C to stop"
    echo "============================================================"
    echo ""

    (sleep 2 && open "$URL/keyboard-visualizer/" 2>/dev/null || xdg-open "$URL/keyboard-visualizer/" 2>/dev/null || echo "Please open $URL/keyboard-visualizer/ in your browser") &

    python -m SimpleHTTPServer $PORT

elif command -v php &> /dev/null; then
    echo "✅ Using PHP built-in server"
    echo "🚀 Starting server..."
    echo ""
    echo "Press Ctrl+C to stop"
    echo "============================================================"
    echo ""

    (sleep 2 && open "$URL/keyboard-visualizer/" 2>/dev/null || xdg-open "$URL/keyboard-visualizer/" 2>/dev/null || echo "Please open $URL/keyboard-visualizer/ in your browser") &

    php -S localhost:$PORT

elif command -v npx &> /dev/null; then
    echo "✅ Using npx serve"
    echo "🚀 Starting server..."
    echo ""
    echo "Press Ctrl+C to stop"
    echo "============================================================"
    echo ""

    (sleep 2 && open "$URL/keyboard-visualizer/" 2>/dev/null || xdg-open "$URL/keyboard-visualizer/" 2>/dev/null || echo "Please open $URL/keyboard-visualizer/ in your browser") &

    npx -y serve -l $PORT

else
    echo "❌ No HTTP server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  • Python 3: brew install python3"
    echo "  • Python 2: brew install python@2"
    echo "  • PHP: brew install php"
    echo "  • Node.js: brew install node"
    echo ""
    exit 1
fi
