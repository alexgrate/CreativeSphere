"""Print exactly which database Django is talking to, and what is in it.

    .venv\\Scripts\\python dbcheck.py

Needs no psql. Read-only.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from django.conf import settings  # noqa: E402
from django.db import connection  # noqa: E402


def mask(url):
    if not url:
        return url
    if "@" in url and "//" in url:
        head, tail = url.split("//", 1)
        creds, rest = tail.split("@", 1)
        user = creds.split(":", 1)[0]
        return f"{head}//{user}:***@{rest}"
    return url


print("=" * 70)
print("WHAT SETTINGS SAY")
print("=" * 70)
db = settings.DATABASES["default"]
print(f"  ENGINE : {db['ENGINE']}")
print(f"  NAME   : {db['NAME']}")
print(f"  HOST   : {db.get('HOST')}   PORT: {db.get('PORT')}   USER: {db.get('USER')}")
print()
print(f"  DATABASE_URL in the process environment:")
print(f"    {mask(os.environ.get('DATABASE_URL')) or '(not set)'}")

print()
print("=" * 70)
print("WHERE .env IS AND WHAT IT SAYS")
print("=" * 70)
env_path = settings.BASE_DIR / ".env"
print(f"  BASE_DIR    : {settings.BASE_DIR}")
print(f"  looking for : {env_path}")
print(f"  exists      : {env_path.exists()}")
if env_path.exists():
    raw = env_path.read_bytes()
    print(f"  size        : {len(raw)} bytes")
    if raw.startswith(b"\xef\xbb\xbf"):
        print("  WARNING     : file starts with a UTF-8 BOM, which breaks its first line")
    hits = [
        line for line in raw.decode("utf-8", "replace").splitlines()
        if "DATABASE_URL" in line
    ]
    print(f"  DATABASE_URL lines found: {len(hits)}")
    for line in hits:
        stripped = line.strip()
        marker = "  (commented out - does nothing)" if stripped.startswith("#") else ""
        print(f"    {mask(stripped)}{marker}")
    if not hits:
        print("    (none - so the machine-wide value is inherited)")
else:
    print("  -> Django found no .env here, so every setting comes from the machine")

print()
print("=" * 70)
print("WHAT THE SERVER SAYS")
print("=" * 70)
is_postgres = "postgresql" in db["ENGINE"]

with connection.cursor() as c:
    if is_postgres:
        c.execute("select current_database(), current_user, current_schema()")
        database, user, schema = c.fetchone()
        print(f"  current_database : {database}")
        print(f"  current_user     : {user}")
        print(f"  current_schema   : {schema}")

        c.execute("show search_path")
        print(f"  search_path      : {c.fetchone()[0]}")

        c.execute(
            "select table_schema, table_name from information_schema.tables "
            "where table_type = 'BASE TABLE' "
            "and table_schema not in ('pg_catalog', 'information_schema') "
            "order by 1, 2"
        )
        rows = c.fetchall()
    else:
        print(f"  sqlite file      : {db['NAME']}")
        c.execute("select 'main', name from sqlite_master where type='table' order by name")
        rows = c.fetchall()
    print()
    print(f"  tables visible ({len(rows)}):")
    for table_schema, table_name in rows:
        print(f"    {table_schema}.{table_name}")
    if not rows:
        print("    (none)")

    print()
    try:
        c.execute("select app, count(*) from django_migrations group by app order by app")
        recorded = c.fetchall()
        print(f"  django_migrations rows by app:")
        for app, n in recorded:
            print(f"    {app:<15} {n}")
        if not recorded:
            print("    (empty - a genuinely fresh database)")
    except Exception as exc:
        print(f"  django_migrations: {type(exc).__name__}: {exc}")

print()
print("=" * 70)
print("VERDICT")
print("=" * 70)
names = {t for _, t in rows}
if "auth_user" in names:
    print("  auth_user EXISTS - createsuperuser should work.")
else:
    print("  auth_user IS MISSING.")
    if any(t.startswith("api_") for t in names):
        print("  But api_* tables are here, so migrate did write to THIS database.")
    print("  Compare 'current_database' above with the database you recreated in")
    print("  pgAdmin. If they differ, .env is pointing somewhere else.")
