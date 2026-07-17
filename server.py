import http.server
import socketserver
import os
import sys

# Try multiple ports in case of conflicts or permission restrictions (Hyper-V reservations)
PORTS_TO_TRY = [8080, 8081, 8000, 8888, 9000, 9999, 0] # 0 falls back to automatic port assignment
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and prevent caching for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

# Change working directory to ensure files are served correctly
os.chdir(DIRECTORY)

httpd = None
assigned_port = None

for port in PORTS_TO_TRY:
    try:
        httpd = socketserver.TCPServer(("", port), MyHTTPRequestHandler)
        # Determine actual port in case port 0 was passed
        assigned_port = httpd.socket.getsockname()[1]
        break
    except OSError as e:
        print(f"[Notice] Port {port} unavailable: {e}. Trying next option...")
        continue

if httpd is None:
    print("[Error] Failed to bind to any available network port.")
    sys.exit(1)

print(f"==================================================")
print(f" ArenaFlow 2026 Local Web Server")
print(f"==================================================")
print(f" Serving files from: {DIRECTORY}")
print(f" Server URL: http://localhost:{assigned_port}")
print(f" Press Ctrl+C to stop the server.")
print(f"==================================================")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\n[Server] Shutting down. Bye!")
    httpd.server_close()
    sys.exit(0)
except Exception as e:
    print(f"\n[Error] Server encountered exception: {e}")
    httpd.server_close()
    sys.exit(1)
