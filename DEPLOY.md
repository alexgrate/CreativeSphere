# Deploying The Creative Sphere to the Windows VM

Both halves run on one machine and one domain:

```
                  dcreativesphere.com   (IIS — holds the TLS certificate)
                            |
      +---------------------+----------------------+
      |                                            |
  everything else                    /api  /admin  /static  /media
      |                                            |
  dist\  (React build, served as files)   waitress on 127.0.0.1:8000
                                                   |
                                            Django + sqlite
```

One origin, so the browser never makes a cross-origin request. That is why
`CORS_ALLOWED_ORIGINS` is empty and `VITE_API_URL` is unset — the frontend calls
`/api/...` on whatever domain served it.

Paths below assume `C:\sites\creativesphere`. Substitute freely, but stay
consistent.

---

## Step 0 — Push the code (do this on your Mac, first)

The VM pulls from GitHub, so anything uncommitted simply will not be there.
Right now the whole `backend\` folder is untracked.

```bash
cd ~/Desktop/Main_Dev/CreativeSphere
git status                 # sanity check
git add -A
git commit -m "Add Django backend, admin CMS, contact form and deployment config"
git push origin main
```

Confirm the secrets stayed out:

```bash
git ls-files | grep -E "\.env$|db\.sqlite3|/media/"     # must print nothing
```

`backend\.env`, `backend\db.sqlite3`, `backend\media\` and both `.venv` folders
are gitignored on purpose. You will recreate `.env` by hand on the VM and get
the images across in Step 6.

---

## Step 1 — Install IIS

On the VM, open **PowerShell as Administrator**:

```powershell
Install-WindowsFeature -Name Web-Server -IncludeManagementTools
```

On Windows 10/11 rather than Server:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-StaticContent, IIS-DefaultDocument, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-HttpCompressionStatic -All
```

**Check:** browse to `http://localhost` on the VM. You should see the IIS
welcome page.

---

## Step 2 — Install the two IIS modules

Neither ships with IIS, and without them the proxy rules in `web.config`
silently return 404.

1. **URL Rewrite 2.1** — https://www.iis.net/downloads/microsoft/url-rewrite
2. **Application Request Routing 3.0** — https://www.iis.net/downloads/microsoft/application-request-routing

Then **turn the proxy on**, which is a separate action people miss:

> IIS Manager → click the **server** name in the left tree (not a site) →
> **Application Request Routing Cache** → *Proxy* → **Server Proxy Settings…**
> (right panel) → tick **Enable proxy** → **Apply**.

**Check:** IIS Manager → server → you should now see both *URL Rewrite* and
*Application Request Routing Cache* icons.

---

## Step 3 — Install Python, Node and Git

- **Python 3.12 or newer** — https://www.python.org/downloads/windows/
  Tick **"Add python.exe to PATH"** during install.
- **Node.js LTS** — https://nodejs.org/ (needed to build the frontend on the VM;
  see the note in Step 7 if you would rather build on your Mac)
- **Git** — https://git-scm.com/download/win
- **NSSM** — https://nssm.cc/download — unzip and copy `win64\nssm.exe` into
  `C:\Windows\System32` so it is on PATH.

**Check**, in a *new* terminal so PATH is picked up:

```bat
python --version
node --version
git --version
nssm version
```

---

## Step 4 — Get the code onto the VM

```bat
mkdir C:\sites
cd C:\sites
git clone https://github.com/alexgrate/CreativeSphere.git creativesphere
cd creativesphere
```

---

## Step 5 — Set up the backend

```bat
cd C:\sites\creativesphere\backend
python -m venv .venv
.venv\Scripts\pip install --upgrade pip
.venv\Scripts\pip install -r requirements.txt
```

### 5a. Create `.env`

```bat
copy .env.example .env
notepad .env
```

Generate a **new** secret key (do not reuse the one from your Mac):

```bat
.venv\Scripts\python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Fill in, leaving HTTPS enforcement **off for now** — you cannot test over HTTPS
until the certificate exists in Step 10:

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

SECURE_SSL_REDIRECT=False
```

> `SECURE_SSL_REDIRECT=False` is temporary. Step 11 removes it.

### 5b. Database, static files, admin account

```bat
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py collectstatic --noinput
.venv\Scripts\python manage.py createsuperuser
```

**Check:** `collectstatic` reports roughly 163 files copied.

---

## Step 6 — Get the images onto the VM

`backend\media\` is gitignored, so the database will reference files that are not
there yet. Two ways:

**Option A — rebuild from the committed source images** (simplest):

```bat
.venv\Scripts\python manage.py seed_work
.venv\Scripts\python manage.py seed_logos
.venv\Scripts\python manage.py seed_faqs
```

These copy from `frontend\public\`, which *is* in git, and use
`update_or_create`, so re-running them is safe.

**Option B — copy your Mac's folder** (keeps anything you uploaded through the
admin). About 3 MB:

```bash
# from your Mac
scp -r backend/media Administrator@<vm-ip>:C:/sites/creativesphere/backend/
```

**Check:**

```bat
dir C:\sites\creativesphere\backend\media\work
```

---

## Step 7 — Build the frontend

```bat
cd C:\sites\creativesphere\frontend
npm ci
npm run build
```

**Check:** `dir dist` shows `index.html`, `assets\`, `web.config`, `robots.txt`
and `sitemap.xml`.

> Prefer not to install Node on the VM? Run `npm run build` on your Mac and copy
> the `dist` folder over instead. The `web.config` is inside it either way.

---

## Step 8 — Run Django as a Windows service

Test it by hand first:

```bat
cd C:\sites\creativesphere\backend
.venv\Scripts\python serve.py
```

In a second terminal:

```bat
curl http://127.0.0.1:8000/api/projects/
```

JSON means it works. Press `Ctrl+C` to stop, then register it so it survives
reboots:

```bat
nssm install CreativeSphere "C:\sites\creativesphere\backend\.venv\Scripts\python.exe" "C:\sites\creativesphere\backend\serve.py"
nssm set CreativeSphere AppDirectory "C:\sites\creativesphere\backend"
nssm set CreativeSphere Start SERVICE_AUTO_START
nssm start CreativeSphere
```

**Check:**

```bat
nssm status CreativeSphere
curl http://127.0.0.1:8000/api/projects/
```

Both should succeed. If the service will not start, `nssm edit CreativeSphere`
→ *I/O* tab → point stdout and stderr at a log file, then read it.

---

## Step 9 — Create the IIS site

### 9a. The site

> IIS Manager → **Sites** → right-click → **Add Website…**
>
> - **Site name:** `creativesphere`
> - **Physical path:** `C:\sites\creativesphere\frontend\dist`
> - **Binding:** http, port 80, hostname `dcreativesphere.com`
>
> Add a second binding for `www.dcreativesphere.com`.

Stop the **Default Web Site** so it does not fight for port 80.

### 9b. Application pool

> IIS Manager → **Application Pools** → `creativesphere` → **Basic Settings…** →
> set **.NET CLR version** to **No Managed Code**.

Nothing here runs .NET — it is static files plus a proxy.

### 9c. Allow the forwarded-protocol header

Without this, IIS refuses to set the variable and Django's HTTPS redirect loops
forever once you enable it.

> IIS Manager → select the **site** → **URL Rewrite** → **View Server
> Variables…** (right panel) → **Add…** → `HTTP_X_FORWARDED_PROTO` → OK.

### 9d. Permissions

> Right-click `C:\sites\creativesphere\frontend\dist` → Properties → Security →
> Edit → Add → `IIS_IUSRS` → allow **Read & execute**.

### 9e. Firewall

```powershell
New-NetFirewallRule -DisplayName "HTTP"  -Direction Inbound -Protocol TCP -LocalPort 80  -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

If the VM is on Azure/AWS/GCP, open 80 and 443 in the cloud firewall too — the
Windows rule alone is not enough.

**Check**, on the VM:

| URL | Expected |
|---|---|
| `http://localhost/` | The site loads, **with images** |
| `http://localhost/work` | Work page with project cards |
| `http://localhost/work/vfd` **refreshed** | Loads — proves the SPA rule |
| `http://localhost/api/projects/` | JSON — proves the proxy |
| `http://localhost/admin/` | Login page **with styling** |

If images are missing but text is fine, see *`.webp` returns 404* in
Troubleshooting.

---

## Step 10 — DNS and the certificate

### 10a. Point the domain at the VM

In **GoDaddy → My Products → DNS**:

| Type | Name | Value |
|---|---|---|
| A | `@` | `<the VM's public IP>` |
| A | `www` | `<the VM's public IP>` |

Delete any conflicting A or CNAME records for `@` and `www` left from the
current hosting. Propagation is usually minutes; up to a few hours.

**Check** from your Mac: `nslookup dcreativesphere.com` returns the VM's IP.

### 10b. Get a free certificate

Download **win-acme** from https://www.win-acme.com/, unzip, and run
`wacs.exe` as Administrator:

```
N  →  Create certificate (default settings)
     → pick the creativesphere site
     → include both dcreativesphere.com and www.dcreativesphere.com
```

It validates over HTTP on port 80, installs the certificate, adds the HTTPS
binding, and schedules automatic renewal every 60 days.

**Check:** `https://dcreativesphere.com` loads with a padlock.

---

## Step 11 — Turn on HTTPS enforcement

Now that the certificate works, remove the temporary override:

```bat
notepad C:\sites\creativesphere\backend\.env
```

Delete the `SECURE_SSL_REDIRECT=False` line entirely — it defaults to **on**
whenever `DEBUG=False`. Then:

```bat
nssm restart CreativeSphere
```

`.env` is read once at startup, so the restart is required.

**Check:** `http://dcreativesphere.com` redirects to `https://`.

---

## Step 12 — Final verification

| Check | Expected |
|---|---|
| `https://dcreativesphere.com/` | Loads with images and video |
| Refresh on `/work/vfd` | Loads, not a 404 |
| `/services` | FAQ rows expand |
| `/about` | Logo strip slides |
| Home page | Logos float in the "Start your project" section |
| `/api/projects/` | JSON, 8 projects |
| `/admin/` | Styled login; log in and edit a project |
| Contact form | Submit a test — mail arrives, and the enquiry shows at `/admin/api/contactmessage/` with **Emailed ✓** |
| `http://` | Redirects to `https://` |
| Share a link in WhatsApp | Preview card with the logo image |

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
nssm restart CreativeSphere
```

Changed `.env`? Restart the service — that is the only way it is re-read.

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
| Text loads, **all images 404** | IIS does not serve `.webp` unless the MIME type is registered. `web.config` does this — confirm `dist\web.config` exists and that IIS Manager → site → *MIME Types* lists `.webp`. |
| `/api/` returns **404** | ARR proxy not enabled. IIS Manager → **server** → ARR Cache → Proxy → tick *Enable proxy*. |
| `/api/` returns **502** | Django is not running. `nssm status CreativeSphere`, then `curl http://127.0.0.1:8000/api/projects/`. |
| Refreshing `/work/vfd` gives **404** | URL Rewrite module not installed, or `web.config` missing from `dist`. |
| Admin loads **unstyled** | `collectstatic` was not run after deploying. |
| Admin login says **CSRF verification failed** | The domain is missing from `CSRF_TRUSTED_ORIGINS`, with the `https://` scheme. Restart the service after editing. |
| Browser reports a **redirect loop** | `SECURE_SSL_REDIRECT` is on but Django cannot tell the request was HTTPS. Needs `BEHIND_PROXY=True` **and** `HTTP_X_FORWARDED_PROTO` added under URL Rewrite → View Server Variables. |
| Site returns **400 Bad Request** | The hostname is missing from `ALLOWED_HOSTS`. |
| Contact form succeeds but **no email** | Look at `/admin/api/contactmessage/`. The enquiry is stored regardless; the *Delivery error* field says why Graph refused it. Usually an expired client secret. |
| `database is locked` | Two things writing sqlite at once. Keep `threads` in `serve.py` low, or move to Postgres. |

---

## Moving to Postgres later

No code change:

```bat
.venv\Scripts\pip install "psycopg[binary]"
```

Add to `.env`, then migrate and re-seed:

```
DATABASE_URL=postgres://user:password@localhost:5432/creativesphere
```
