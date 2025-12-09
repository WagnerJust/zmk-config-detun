#!/usr/bin/env python3
"""
Simple HTTP server launcher for the keyboard visualizer.
Serves from project root to access config files.

Usage:
    python3 start-server.py
    or
    ./start-server.py (if executable)

Then open: http://localhost:8000/keyboard-visualizer/
"""

import http.server
import json
import os
import socketserver
import sys
import webbrowser
from pathlib import Path

# Configuration
PORT = 8000
# Serve from project root (one level up from keyboard-visualizer)
PROJECT_ROOT = Path(__file__).parent.parent
# Key colors storage file
KEY_COLORS_FILE = Path(__file__).parent / "key-colors.json"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def end_headers(self):
        # Enable CORS
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        if self.path == "/api/key-colors":
            try:
                # Check if colors file exists
                if not KEY_COLORS_FILE.exists():
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({}).encode('utf-8'))
                    return

                # Read and return colors
                with open(KEY_COLORS_FILE, 'r', encoding='utf-8') as f:
                    colors = json.load(f)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(colors).encode('utf-8'))

                print(f"✅ Loaded key colors from: {KEY_COLORS_FILE}")

            except Exception as e:
                self.send_error(500, f"Error loading key colors: {str(e)}")
                print(f"❌ Error loading key colors: {e}")
        else:
            # Fall back to default file serving
            super().do_GET()

    def do_POST(self):
        """Handle POST requests for saving keymap and key colors"""
        if self.path == "/api/key-colors":
            try:
                # Read request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                colors = json.loads(post_data.decode('utf-8'))

                # Ensure parent directory exists
                KEY_COLORS_FILE.parent.mkdir(parents=True, exist_ok=True)

                # Write the colors file
                with open(KEY_COLORS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(colors, f, indent=2)

                # Send success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'success': True,
                    'message': 'Key colors saved successfully',
                    'path': str(KEY_COLORS_FILE)
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))

                print(f"✅ Saved key colors to: {KEY_COLORS_FILE}")

            except Exception as e:
                self.send_error(500, f"Error saving key colors: {str(e)}")
                print(f"❌ Error saving key colors: {e}")

        elif self.path == "/api/save-keymap":
            try:
                # Read request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))

                # Validate request
                if 'keymap_content' not in data:
                    self.send_error(400, "Missing keymap_content in request")
                    return

                # Keymap file path (relative to project root)
                keymap_path = PROJECT_ROOT / "config" / "boards" / "shields" / "detun" / "detun.keymap"

                # Ensure directory exists
                keymap_path.parent.mkdir(parents=True, exist_ok=True)

                # Write the keymap file
                with open(keymap_path, 'w', encoding='utf-8') as f:
                    f.write(data['keymap_content'])

                # Send success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'success': True,
                    'message': 'Keymap saved successfully',
                    'path': str(keymap_path)
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))

                print(f"✅ Saved keymap to: {keymap_path}")

            except Exception as e:
                self.send_error(500, f"Error saving keymap: {str(e)}")
                print(f"❌ Error saving keymap: {e}")
        else:
            self.send_error(404, "Endpoint not found")

    def do_DELETE(self):
        """Handle DELETE requests for removing key colors"""
        if self.path == "/api/key-colors":
            try:
                # Delete the colors file if it exists
                if KEY_COLORS_FILE.exists():
                    KEY_COLORS_FILE.unlink()
                    print(f"✅ Deleted key colors file: {KEY_COLORS_FILE}")

                # Send success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'success': True,
                    'message': 'Key colors reset successfully'
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))

            except Exception as e:
                self.send_error(500, f"Error deleting key colors: {str(e)}")
                print(f"❌ Error deleting key colors: {e}")
        else:
            self.send_error(404, "Endpoint not found")

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
    # Change to project root
    os.chdir(PROJECT_ROOT)

    # Find a free port
    port = find_free_port(PORT)
    if port is None:
        print(f"❌ Could not find a free port between {PORT} and {PORT + 10}")
        sys.exit(1)

    # Create server
    with socketserver.TCPServer(("", port), Handler) as httpd:
        url = f"http://localhost:{port}/keyboard-visualizer/"

        print("=" * 60)
        print("🎹 Detun Keyboard Visualizer Server")
        print("=" * 60)
        print(f"✅ Server running at: {url}")
        print(f"📁 Serving directory: {PROJECT_ROOT}")
        print(f"📂 Config accessible at: {PROJECT_ROOT}/config")
        print()
        print("🌐 Opening browser automatically...")
        print()
        print("Press Ctrl+C to stop the server")
        print("=" * 60)

        # Open browser to keyboard-visualizer subdirectory
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