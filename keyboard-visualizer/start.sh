#!/bin/bash
# Keyboard Visualizer Launcher
# Launches the custom Python server with save functionality

set -e

VISUALIZER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================================"
echo "🎹 Detun Keyboard Visualizer Launcher"
echo "============================================================"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Using custom Python server with save functionality"
    echo "🚀 Starting server..."
    echo ""
    
    cd "$VISUALIZER_DIR"
    python3 start-server.py
else
    echo "❌ Python 3 is required for the keyboard visualizer!"
    echo ""
    echo "Please install Python 3:"
    echo "  • macOS: brew install python3"
    echo "  • Ubuntu/Debian: sudo apt-get install python3"
    echo "  • Fedora: sudo dnf install python3"
    echo ""
    exit 1
fi
