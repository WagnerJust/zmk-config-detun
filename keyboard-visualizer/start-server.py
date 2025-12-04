#!/usr/bin/env python3
"""
Simple HTTP server launcher for the keyboard visualizer.
This avoids CORS issues with file:// protocol.

Usage:
    python3 start-server.py
    or
    ./start-server.py (if executable)

Then open: http://localhost:8000
"""

import http.server
import os
import socketserver
import sys
import webbrowser
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = Path(__file__).parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def end_headers(self):
        # Enable CORS
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {format % args}")


def find_free_port(start_port=8000, max_attempts=10):
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socketserver.TCPServer(("", port), None) as s:
                return port
        except OSError:
            continue
    return None


def main():
    # Change to script directory
    os.chdir(DIRECTORY)

    # Find a free port
    port = find_free_port(PORT)
    if port is None:
        print(f"❌ Could not find a free port between {PORT} and {PORT + 10}")
        sys.exit(1)

    # Create server
    with socketserver.TCPServer(("", port), Handler) as httpd:
        url = f"http://localhost:{port}"

        print("=" * 60)
        print("🎹 Detun Keyboard Visualizer Server")
        print("=" * 60)
        print(f"✅ Server running at: {url}")
        print(f"📁 Serving directory: {DIRECTORY}")
        print()
        print("🌐 Opening browser automatically...")
        print()
        print("Press Ctrl+C to stop the server")
        print("=" * 60)

        # Open browser
        try:
            webbrowser.open(url)
        except Exception as e:
            print(f"⚠️  Could not open browser automatically: {e}")
            print(f"   Please open {url} manually")

        # Serve forever
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Shutting down server...")
            print("Goodbye!")


if __name__ == "__main__":
    main()
