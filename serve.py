"""Serve the Course Encryption Program web front-end on localhost.

Usage:  python serve.py            -> http://localhost:5000/
        python serve.py 8080       -> http://localhost:8080/
"""
import http.server
import os
import sys
import webbrowser
from functools import partial

ROOT = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(ROOT, "web")
# Let the page read the real text files that program.py uses.
SHARED = {"/original.txt", "/encrypted.txt"}


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean = path.split("?", 1)[0].split("#", 1)[0]
        if clean in SHARED:
            return os.path.join(ROOT, clean.lstrip("/"))
        return super().translate_path(path)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    handler = partial(Handler, directory=WEB)
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        url = f"http://localhost:{port}/"
        print(f"Course Encryption Program running at {url}  (Ctrl+C to stop)")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
