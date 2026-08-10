"""Production entry point for Windows.

gunicorn does not run on Windows, so waitress is the WSGI server. IIS sits in
front and proxies to this; nothing outside the machine should reach port 8000
directly, which is why it binds to localhost only.

    .venv\\Scripts\\python.exe serve.py

To keep it running across reboots, register it as a Windows service with NSSM:

    nssm install CreativeSphere "C:\\path\\to\\backend\\.venv\\Scripts\\python.exe" "C:\\path\\to\\backend\\serve.py"
    nssm set CreativeSphere AppDirectory "C:\\path\\to\\backend"
    nssm start CreativeSphere
"""

import os

from waitress import serve

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application  # noqa: E402  (must follow the line above)

application = get_wsgi_application()

if __name__ == "__main__":
    from django.conf import settings

    print(f"CreativeSphere backend on 127.0.0.1:{settings.BACKEND_PORT}", flush=True)
    serve(
        application,
        listen=f"127.0.0.1:{settings.BACKEND_PORT}",
        # Every image is served through Django while SERVE_MEDIA is on, and a
        # single page pulls a lot of them, so 4 threads queues visibly. These
        # are cheap: an image response never touches the database.
        threads=12,
        # long enough for the contact form's Graph call, which can take a second
        channel_timeout=60,
        ident="CreativeSphere",
    )
