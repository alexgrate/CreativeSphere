# Deploying The Creative Sphere to the Windows VM

Both halves run on one machine and one domain:

```
                  dcreativesphere.com   (IIS — holds the TLS certificate)
                            |
      +---------------------+----------------------+
      |                                            |
  everything else                    /api  /admin  /static  /media
      |                                            |
  dist\  (React build, served as files)   waitress on 127.0.0.1:8001
                                                   |
                                            Django + sqlite
```

One origin, so the browser never makes a cross-origin request. That is why
`CORS_ALLOWED_ORIGINS` is empty and `VITE_API_URL` is unset — the frontend calls
`/api/...` on whatever domain served it.

Paths below assume `C:\sites\creativesphere`. Substitute freely, but stay
consistent.

---

## This VM already hosts other projects

Read this before anything else. Three things can collide, and one piece of
common advice would actively break a neighbouring site.

**Port 8000 is already taken on this VM** by your other Django app. This
deployment uses **8001**, which must be set in **two** places that agree:

- `BACKEND_PORT=8001` in `backend\.env`
- the `<action type="Rewrite" url="http://127.0.0.1:8001/{R:0}" />` line in
  `frontend\public\web.config`

Change both or you get a 502.

**Do not stop the Default Web Site**, and do not touch the other sites. On this
VM the Default Web Site *is* `helpdesk.dash-mfb.com`, and stopping it would take
that offline.

Several sites share port 80 fine, because **IIS routes to the most specific
match**. Three of your sites (`dash-mobile`, `Dash_hr_frontend`,
`dash_hr_backend`) are bound with no host header, which sounds alarming but only
means they catch hostnames nothing else claims. The moment this site has an
explicit `dcreativesphere.com` binding, it wins that hostname outright. The one
rule that matters: **always set the hostname on your bindings** (Step 7a).

**Names must be unique** — the IIS site (`creativesphere`), its application pool,
and the pm2 process or NSSM service. Step 1 warns if any are taken.

Nothing else is shared. The Python virtual environment, the database and the
uploaded images all live under this project's folder and cannot affect your
other apps.

---

## Step 0 — Push the code (on your Mac, first)

The VM pulls from GitHub, so anything uncommitted will not be there. Right now
the whole `backend\` folder is untracked.

```bash
cd ~/Desktop/Main_Dev/CreativeSphere
git status
git add -A
git commit -m "Add Django backend, admin CMS, contact form and deployment config"
git push origin main
```

Confirm the secrets stayed out — this must print nothing:

```bash
git ls-files | grep -E "\.env$|db\.sqlite3|/media/"
```

`backend\.env`, `backend\db.sqlite3`, `backend\media\` and both `.venv` folders
are gitignored deliberately. You recreate `.env` by hand in Step 3 and bring the
images across in Step 4.

---

## Step 1 — Audit the VM

Clone first, then run the audit script. It changes nothing — it reports what is
installed and surveys what is already using the ports and hostnames this
deployment wants.

```bat
mkdir C:\sites
cd C:\sites
git clone https://github.com/alexgrate/CreativeSphere.git creativesphere
cd creativesphere\deploy
powershell -ExecutionPolicy Bypass -File .\preflight.ps1
```

It checks:

| | |
|---|---|
| IIS | service present and running |
| URL Rewrite 2.1 | module installed — without it, refreshing `/work/vfd` 404s |
| ARR 3.0 | module installed **and** server-level proxy enabled, which is a separate switch |
| Python | present and 3.12+, falling back to the `py` launcher if `python` is the Store stub |
| Node, npm, Git | present and on PATH |
| NSSM **or** pm2 | either can keep Django running; pm2 is already here |
| win-acme | present (informational — you may already issue certificates another way) |
| **Port 8000** | free, or who holds it, plus three free ports to use instead |
| **Ports 8000–8100** | everything currently listening, so you can see your other apps |
| **IIS sites** | every site, its state, path and bindings — flagging any with no host header |
| **Services** | anything that looks like an app server, and whether `CreativeSphere` is taken |
| Firewall | inbound 80 and 443 |

Anything marked `MISSING` needs installing before you continue; the line
includes where to get it. Anything marked `WARN` is a collision to resolve —
usually by picking a different port or name.

---

## Step 2 — Backend dependencies

> **On this VM, use `py`, not `python`.** The `python` on PATH is the Microsoft
> Store stub at `AppData\Local\Microsoft\WindowsApps\python.exe`, which prints
> *"Python was not found"* and does nothing. The `py` launcher finds the real
> interpreter — 3.13.14, which is fine. This only matters for the line that
> creates the environment; every command after it calls `.venv\Scripts\...`
> directly, which is a real interpreter.

```bat
cd C:\sites\creativesphere\backend
py -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\pip install -r requirements.txt
```

**Check:**

```bat
.venv\Scripts\python --version
```

Should print `Python 3.13.14`. If it prints the Store message instead, the venv
was created by the stub — delete `.venv` and redo it with `py -m venv`.

The virtual environment is entirely separate from your other Django project —
different versions here cannot affect it.

---

## Step 3 — Create `.env`

```bat
copy .env.example .env
notepad .env
```

Generate a **new** secret key — do not reuse the one from your Mac:

```bat
.venv\Scripts\python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Fill in, leaving HTTPS enforcement **off for now**. You cannot test over HTTPS
until the certificate exists in Step 8, and with it on you would be debugging a
site you cannot reach:

```
SECRET_KEY=<the key you just generated>
DEBUG=False
ALLOWED_HOSTS=dcreativesphere.com,www.dcreativesphere.com,127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=
CSRF_TRUSTED_ORIGINS=https://dcreativesphere.com,https://www.dcreativesphere.com

MS_GRAPH_TENANT_ID=<from your Mac's .env>
MS_GRAPH_CLIENT_ID=<from your Mac's .env>
MS_GRAPH_CLIENT_SECRET=<from your Mac's .env>
MS_GRAPH_SENDER=robot@dash-mfb.com
CONTACT_RECIPIENT=alexgrate606@gmail.com

TIME_ZONE=Africa/Lagos

BEHIND_PROXY=True
SERVE_MEDIA=True

BACKEND_PORT=8001

SECURE_SSL_REDIRECT=False
```

> Port 8000 is held by your other Django app, so this uses **8001**. Edit
> `frontend\public\web.config` to match before building in Step 5 — change
> `http://127.0.0.1:8000` to `http://127.0.0.1:8001`.

### 3a. Give this project its own Postgres database

> **Do not reuse the database from the inherited `DATABASE_URL`.** That variable
> is set machine-wide for another Django project. Pointing this app at it would
> create Creative Sphere's tables inside that project's database.

Making the new user the *owner* of the database avoids the schema-permission
trap in Postgres 15+: without ownership the role can connect but cannot create
tables in the `public` schema, and `migrate` fails partway through.

**In psql**, as the `postgres` superuser:

```sql
CREATE USER creativesphere WITH PASSWORD 'pick-a-strong-one';
CREATE DATABASE creativesphere OWNER creativesphere;
```

**Or in pgAdmin**, which is already installed on this VM:

1. Right-click **Login/Group Roles** -> *Create* -> *Login/Group Role...*
   - **General**: Name `creativesphere`
   - **Definition**: set a password
   - **Privileges**: **Can login? = Yes** (easy to miss; without it the role
     cannot connect at all)
2. Right-click **Databases** -> *Create* -> *Database...*
   - **General**: Database `creativesphere`, **Owner `creativesphere`**

Check the server's real host before writing the connection string: right-click
the server -> *Properties* -> *Connection*. The entry named "Dash MFB Production"
may point somewhere other than this VM, in which case use that host and port
rather than `localhost:5432`.

Confirm you can reach it:

```bat
psql -U creativesphere -d creativesphere -h localhost -c "select current_database(), current_user;"
```

Then set that exact connection string in `.env`:

```
DATABASE_URL=postgres://creativesphere:pick-a-strong-one@localhost:5432/creativesphere
```

Percent-encode any of `: / ? # [ ] @` in the password — an `@` splits the URL in
the wrong place and gives a baffling host error. `@` becomes `%40`.

### 3b. Migrate

```bat
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py collectstatic --noinput
.venv\Scripts\python manage.py createsuperuser
```

**Check:** every migration applies, and `collectstatic` reports roughly 163
files. Then confirm it really used the new database:

```bat
.venv\Scripts\python -c "import os,sys;sys.path.insert(0,'.');os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings');import django;django.setup();from django.conf import settings;print(settings.DATABASES['default']['NAME'])"
```

It must print `creativesphere` — not your other project's database name.

---

## Step 4 — Get the images onto the VM

`backend\media\` is gitignored, so the database references files that are not
there yet. Two ways:

**Option A — rebuild from the committed source images** (simplest):

```bat
.venv\Scripts\python manage.py seed_work
.venv\Scripts\python manage.py seed_logos
.venv\Scripts\python manage.py seed_faqs
```

These copy from `frontend\public\`, which *is* in git, and use
`update_or_create`, so re-running them is safe.

**Option B — copy your Mac's folder**, which keeps anything you uploaded through
the admin. About 3 MB:

```bash
scp -r backend/media Administrator@<vm-ip>:C:/sites/creativesphere/backend/
```

**Check:** `dir C:\sites\creativesphere\backend\media\work`

---

## Step 5 — Build the frontend

```bat
cd C:\sites\creativesphere\frontend
npm ci
npm run build
```

**Check:** `dir dist` shows `index.html`, `assets\`, `web.config`, `robots.txt`
and `sitemap.xml`.

> Node already on the VM for another project is fine — `npm ci` installs into
> this folder's own `node_modules`. If you would rather not build here at all,
> run `npm run build` on your Mac and copy `dist` over; `web.config` is inside it
> either way.

---

## Step 6 — Keep Django running

Test by hand first:

```bat
cd C:\sites\creativesphere\backend
.venv\Scripts\python serve.py
```

It prints the port it bound to. In a second terminal:

```bat
curl http://127.0.0.1:8001/api/projects/
```

JSON means it works. `Ctrl+C`, then keep it running across reboots. Either
process manager is fine — **you already have pm2 on this VM**, so Option A needs
no new software.

### Option A — pm2 (already installed here)

pm2 is not just for Node; `--interpreter none` makes it run any executable.

```bat
pm2 start "C:\sites\creativesphere\backend\.venv\Scripts\python.exe" ^
    --name creativesphere ^
    --cwd "C:\sites\creativesphere\backend" ^
    --interpreter none ^
    -- serve.py

pm2 save
```

`pm2 save` writes it into the resurrect list, so it comes back with the pm2
service that is already running on this machine.

Useful afterwards:

```bat
pm2 status
pm2 logs creativesphere
pm2 restart creativesphere
```

### Option B — NSSM (a true Windows service)

Download from https://nssm.cc/download and copy `win64\nssm.exe` into
`C:\Windows\System32`, then:

```bat
nssm install CreativeSphere "C:\sites\creativesphere\backend\.venv\Scripts\python.exe" "C:\sites\creativesphere\backend\serve.py"
nssm set CreativeSphere AppDirectory "C:\sites\creativesphere\backend"
nssm set CreativeSphere Start SERVICE_AUTO_START
nssm start CreativeSphere
```

If it will not start: `nssm edit CreativeSphere` → *I/O* tab → point stdout and
stderr at a log file, restart, read the log.

**Check either way:** `curl http://127.0.0.1:8001/api/projects/` still returns
JSON after a reboot.

---

## Step 7 — Create the IIS site

### 7a. The site

> IIS Manager → **Sites** → right-click → **Add Website…**
>
> - **Site name:** `creativesphere`
> - **Physical path:** `C:\sites\creativesphere\frontend\dist`
> - **Binding:** http, port 80, **hostname `dcreativesphere.com`**

Add a second binding for `www.dcreativesphere.com`.

**Always set the hostname.** A blank host header means this site answers for
every domain on the machine, including your other projects'.

### 7b. Application pool

> **Application Pools** → `creativesphere` → **Basic Settings…** → **.NET CLR
> version: No Managed Code**.

Nothing here runs .NET — it is static files plus a proxy. Leave it in its own
pool so a restart never touches your other sites.

### 7c. Allow the forwarded-protocol header

> Select the **site** → **URL Rewrite** → **View Server Variables…** (right
> panel) → **Add…** → `HTTP_X_FORWARDED_PROTO`

This is per-site, so it does not affect anything else. Without it, Django's
HTTPS redirect loops forever once enabled.

### 7d. Permissions

> Right-click `C:\sites\creativesphere\frontend\dist` → Properties → Security →
> Edit → Add → `IIS_IUSRS` → allow **Read & execute**.

### 7e. Firewall

Already open if your other sites are reachable. If Step 1 flagged it:

```powershell
New-NetFirewallRule -DisplayName "HTTP"  -Direction Inbound -Protocol TCP -LocalPort 80  -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

Cloud VM? Open 80 and 443 in the provider's firewall too.

### Check before moving on

From the VM, using the hostname (not `localhost`, which will not match the host
header). Add a temporary line to `C:\Windows\System32\drivers\etc\hosts` if DNS
has not moved yet:

```
127.0.0.1  dcreativesphere.com
```

| URL | Expected |
|---|---|
| `http://dcreativesphere.com/` | Site loads, **with images** |
| `http://dcreativesphere.com/work/vfd` **refreshed** | Loads — proves the SPA rule |
| `http://dcreativesphere.com/api/projects/` | JSON — proves the proxy |
| `http://dcreativesphere.com/admin/` | Login page **with styling** |
| Your other sites | Still working |

Remove the `hosts` line afterwards.

---

## Step 8 — DNS and the certificate

### 8a. Point the domain at the VM

**GoDaddy → My Products → DNS**:

| Type | Name | Value |
|---|---|---|
| A | `@` | `<the VM's public IP>` |
| A | `www` | `<the VM's public IP>` |

Delete conflicting A or CNAME records for `@` and `www` from the current
hosting. Propagation is usually minutes.

**Check** from your Mac: `nslookup dcreativesphere.com` returns the VM's IP.

### 8b. Certificate

If this VM already issues certificates with win-acme, add this domain the same
way you did the others. Otherwise download it from https://www.win-acme.com/ and
run `wacs.exe` as Administrator:

```
N  →  Create certificate (default settings)
     → pick the creativesphere site
     → include dcreativesphere.com and www.dcreativesphere.com
```

It validates on port 80, installs the certificate, adds the HTTPS binding and
schedules renewal every 60 days.

**Check:** `https://dcreativesphere.com` loads with a padlock.

---

## Step 9 — Turn on HTTPS enforcement

```bat
notepad C:\sites\creativesphere\backend\.env
```

Delete the `SECURE_SSL_REDIRECT=False` line — it defaults to **on** whenever
`DEBUG=False`. Then:

```bat
nssm restart CreativeSphere
```

`.env` is read once at startup, so the restart is required.

**Check:** `http://dcreativesphere.com` redirects to `https://`.

---

## Step 10 — Final verification

| Check | Expected |
|---|---|
| `https://dcreativesphere.com/` | Loads with images and video |
| Refresh on `/work/vfd` | Loads, not a 404 |
| `/services` | FAQ rows expand |
| `/about` | Logo strip slides |
| Home page | Logos float in the "Start your project" section |
| `/api/projects/` | JSON, 8 projects |
| `/admin/` | Styled login; log in and edit a project |
| Contact form | Mail arrives, and the enquiry shows at `/admin/api/contactmessage/` with **Emailed ✓** |
| `http://` | Redirects to `https://` |
| Share a link in WhatsApp | Preview card with the logo image |
| **Your other sites** | **Still working** |

---

## Redeploying later

```bat
cd C:\sites\creativesphere
git pull

cd frontend
npm ci
npm run build

cd ..\backend
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py collectstatic --noinput
pm2 restart creativesphere       :: or: nssm restart CreativeSphere
```

Changed `.env`? Restart it — that is the only way it is re-read.

---

## Backups

`backend\db.sqlite3` holds every project, logo, FAQ and contact enquiry.
`backend\media\` holds every uploaded image. Neither is in git.

```bat
xcopy C:\sites\creativesphere\backend\db.sqlite3 D:\backups\ /Y
xcopy C:\sites\creativesphere\backend\media D:\backups\media /E /I /Y
```

Worth a scheduled task, and worth doing before every deploy.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Text loads, **all images 404** | IIS does not serve `.webp` unless the MIME type is registered. `web.config` does this — confirm `dist\web.config` exists and IIS Manager → site → *MIME Types* lists `.webp`. |
| `/api/` returns **404** | ARR proxy not enabled at server level. Re-run `preflight.ps1`. |
| `/api/` returns **502** | Django not running, or on a different port than `web.config` expects. `pm2 status`, then curl `127.0.0.1:8001`. Check `web.config` says 8001, not 8000. |
| **Another project broke** | This site is bound to port 80 with no host header, so it is catching their traffic. Add the hostname to its binding. |
| **This site shows another project** | The reverse — their site has the blank host header. Give theirs an explicit hostname. |
| Refreshing `/work/vfd` gives **404** | URL Rewrite not installed, or `web.config` missing from `dist`. |
| Admin loads **unstyled** | `collectstatic` not run after deploying. |
| Admin login: **CSRF verification failed** | Domain missing from `CSRF_TRUSTED_ORIGINS`, with the `https://` scheme. Restart after editing. |
| **Redirect loop** | `SECURE_SSL_REDIRECT` on but Django cannot tell the request was HTTPS. Needs `BEHIND_PROXY=True` **and** `HTTP_X_FORWARDED_PROTO` allowed under URL Rewrite → View Server Variables. |
| **400 Bad Request** | Hostname missing from `ALLOWED_HOSTS`. |
| Service will not start | Port already taken — the log will say so. Change `BACKEND_PORT` and the `web.config` proxy line together. |
| Contact form succeeds but **no email** | `/admin/api/contactmessage/` — the enquiry is stored regardless and *Delivery error* says why Graph refused. Usually an expired client secret. |
| `database is locked` | Two things writing sqlite at once. Keep `threads` low in `serve.py`, or move to Postgres. |
| `Python was not found` | You used `python` rather than `py`. The `python` on PATH is the Microsoft Store stub. Use `py -m venv .venv`, then `.venv\Scripts\python` for everything else. |

---

## Switching between Postgres and sqlite

The driver ships in `requirements.txt`, so it is only ever a `DATABASE_URL`
change plus `migrate`. An empty `DATABASE_URL=` line means the local sqlite file.

Whichever you use, **keep the line present**. Removing or commenting it out
means this app inherits the machine-wide `DATABASE_URL` belonging to another
project on this server.
