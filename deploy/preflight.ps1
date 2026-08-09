<#
    Pre-deployment audit for the Windows VM.

    Reports what is already installed, and - because this machine already runs
    other projects - surveys what is already using the ports and hostnames this
    deployment wants.

    Run in PowerShell as Administrator:

        cd C:\sites\creativesphere\deploy
        powershell -ExecutionPolicy Bypass -File .\preflight.ps1

    It changes nothing. Read-only.
#>

$ErrorActionPreference = 'SilentlyContinue'

$script:Missing = 0

function Report {
    param([string]$Status, [string]$Name, [string]$Detail = '')
    $colour = switch ($Status) {
        'OK'      { 'Green' }
        'MISSING' { 'Red' }
        'WARN'    { 'Yellow' }
        default   { 'Gray' }
    }
    if ($Status -eq 'MISSING') { $script:Missing++ }
    Write-Host ('  [{0,-7}] ' -f $Status) -ForegroundColor $colour -NoNewline
    Write-Host ('{0,-24} {1}' -f $Name, $Detail)
}

function Section { param([string]$Title)
    Write-Host ''
    Write-Host $Title -ForegroundColor Cyan
    Write-Host ('-' * 74) -ForegroundColor DarkGray
}

Write-Host ''
Write-Host 'Creative Sphere - VM preflight' -ForegroundColor White
Write-Host ('=' * 74) -ForegroundColor DarkGray

# ---------------------------------------------------------------- prerequisites
Section 'Prerequisites'

$w3svc = Get-Service -Name W3SVC
if ($w3svc) { Report 'OK' 'IIS' "service is $($w3svc.Status)" }
else        { Report 'MISSING' 'IIS' 'Install-WindowsFeature Web-Server -IncludeManagementTools' }

$inetsrv = Join-Path $env:windir 'system32\inetsrv'

if (Test-Path (Join-Path $inetsrv 'rewrite.dll')) {
    Report 'OK' 'URL Rewrite' 'module present'
} else {
    Report 'MISSING' 'URL Rewrite' 'iis.net/downloads/microsoft/url-rewrite'
}

# ARR does not install its DLL under inetsrv, so detect it by the config section
# it registers - system.webServer/proxy exists only when ARR is present.
$proxy = Get-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' `
            -Filter 'system.webServer/proxy' -Name 'enabled'
if ($null -eq $proxy) {
    Report 'MISSING' 'ARR' 'iis.net/downloads/microsoft/application-request-routing'
    Report 'MISSING' 'ARR proxy enabled' 'install ARR first'
} else {
    Report 'OK' 'ARR' 'module present'
    if ($proxy.Value -eq $true) {
        Report 'OK' 'ARR proxy enabled' 'server-level proxy is on'
    } else {
        Report 'MISSING' 'ARR proxy enabled' 'IIS Manager > server > ARR Cache > Proxy > Enable proxy'
    }
}

function Probe {

    param([string]$Label, [string]$Exe, [string]$Flag, [string]$Hint)
    $cmd = Get-Command $Exe
    if (-not $cmd) { Report 'MISSING' $Label $Hint; return $null }
    $out = (cmd /c "$Exe $Flag 2>&1" | Where-Object { $_ -match '\S' } | Select-Object -First 1)
    if (-not $out) {
        Report 'WARN' $Label "no output - resolved to $($cmd.Source)"
        return $null
    }
    Report 'OK' $Label "$out"
    return "$out"
}

$py = Probe 'Python' 'python' '--version' 'python.org/downloads/windows (tick Add to PATH)'
if (-not $py) {
    # a bare `python` on PATH is often the Microsoft Store stub, which answers
    # nothing useful; the py launcher finds the real interpreters
    $py = Probe 'Python (py launcher)' 'py' '-V' 'python.org/downloads/windows'
    if ($py) {
        Write-Host '           `python` is not usable but `py` is. Create the venv with:' -ForegroundColor Yellow
        Write-Host '             py -m venv .venv' -ForegroundColor Yellow
    }
}
if ($py -match '(\d+)\.(\d+)') {
    $maj = [int]$Matches[1]; $min = [int]$Matches[2]
    if ($maj -lt 3 -or ($maj -eq 3 -and $min -lt 12)) {
        Report 'WARN' 'Python version' "found $maj.$min - this project expects 3.12 or newer"
    } else {
        Report 'OK' 'Python version' "$maj.$min is fine"
    }
} elseif ($py) {
    Report 'WARN' 'Python version' 'could not parse the version - check it by hand'
}

Probe 'Node.js' 'node' '--version' 'nodejs.org (or build dist on your Mac and copy it)' | Out-Null
Probe 'npm'     'npm'  '--version' 'ships with Node.js'                                 | Out-Null
Probe 'Git'     'git'  '--version' 'git-scm.com/download/win'                           | Out-Null

# Either process manager will do. NSSM makes a real Windows service; pm2 is
# already here for the Node projects and can run this too.
$hasNssm = [bool](Get-Command nssm)
$pm2Cmd = Get-Command pm2
$pm2Svc = Get-Service | Where-Object { $_.Name -match 'pm2' -and $_.Status -eq 'Running' }

if ($hasNssm) {
    Report 'OK' 'NSSM' 'on PATH'
} elseif ($pm2Cmd) {
    Report 'OK' 'pm2' "on PATH - use it instead of NSSM (DEPLOY.md Step 6)"
} elseif ($pm2Svc) {
    # installed for another account, so the shim is missing from this PATH
    $guess = Join-Path $env:APPDATA 'npm\pm2.cmd'
    $found = if (Test-Path $guess) { $guess } else { '(run: npm root -g)' }
    Report 'WARN' 'pm2' "service running but not on this PATH - try $found"
    Write-Host '           Either call pm2 by its full path, or install NSSM instead.' -ForegroundColor Yellow
} else {
    Report 'MISSING' 'NSSM or pm2' 'nssm.cc/download, copy nssm.exe into System32'
}

if (Get-Command wacs) { Report 'OK' 'win-acme' 'on PATH' }
else { Report 'INFO' 'win-acme' 'only needed if this VM does not already issue certificates' }

# ------------------------------------------------------------------ collisions
Section 'What is already running (this VM hosts other projects)'

$wanted = 8000
$busy = Get-NetTCPConnection -LocalPort $wanted -State Listen
if ($busy) {
    $owner = (Get-Process -Id $busy[0].OwningProcess).ProcessName
    Report 'WARN' "Port $wanted" "IN USE by '$owner' (PID $($busy[0].OwningProcess))"
    $free = 8001..8020 | Where-Object {
        -not (Get-NetTCPConnection -LocalPort $_ -State Listen)
    } | Select-Object -First 3
    Write-Host ''
    Write-Host '           Port 8000 is taken. Pick one of these free ports:' -ForegroundColor Yellow
    Write-Host "             $($free -join ', ')" -ForegroundColor Yellow
    Write-Host '           Then set BACKEND_PORT in backend\.env AND the proxy' -ForegroundColor Yellow
    Write-Host '           line in frontend\public\web.config to match.' -ForegroundColor Yellow
} else {
    Report 'OK' "Port $wanted" 'free'
}

Write-Host ''
Write-Host '  Listening on 8000-8100:' -ForegroundColor Gray
$listeners = Get-NetTCPConnection -State Listen |
    Where-Object { $_.LocalPort -ge 8000 -and $_.LocalPort -le 8100 } |
    Sort-Object LocalPort -Unique
if ($listeners) {
    foreach ($l in $listeners) {
        $p = Get-Process -Id $l.OwningProcess
        Write-Host ('    {0,-6} {1}' -f $l.LocalPort, $p.ProcessName)
    }
} else {
    Write-Host '    (nothing)'
}

Section 'Existing IIS sites'

Import-Module WebAdministration
$sites = Get-Website
if ($sites) {
    foreach ($s in $sites) {
        Write-Host ("  {0,-26} {1,-8} {2}" -f $s.Name, $s.State, $s.PhysicalPath)
        foreach ($b in $s.Bindings.Collection) {
            $hostHeader = ($b.bindingInformation -split ':')[2]
            $label = if ($hostHeader) { $hostHeader } else { '(no host header - catch-all fallback)' }
            Write-Host ("      {0,-10} {1}" -f $b.protocol, $label) -ForegroundColor DarkGray
        }
    }
    Write-Host ''
    Write-Host '  IIS routes to the MOST SPECIFIC match, so a site bound with an explicit' -ForegroundColor Gray
    Write-Host '  hostname wins over any site bound with no host header. Give this site an' -ForegroundColor Gray
    Write-Host '  explicit dcreativesphere.com binding and the sites above cannot take it.' -ForegroundColor Gray
    Write-Host '  Those no-host-header sites only catch hostnames nothing else claims.' -ForegroundColor Gray
    Write-Host '  Do NOT stop them - they belong to other projects.' -ForegroundColor Gray

    if ($sites.Name -contains 'creativesphere') {
        Report 'WARN' 'Site name' "'creativesphere' already exists"
    }
} else {
    Write-Host '  (none)'
}

Section 'Existing services that look like app servers'

$svc = Get-Service | Where-Object {
    $_.Name -match 'nssm|django|waitress|gunicorn|node|pm2|creative' -or
    $_.DisplayName -match 'nssm|django|waitress|node|creative'
}
if ($svc) {
    foreach ($s in $svc) { Write-Host ('  {0,-30} {1}' -f $s.Name, $s.Status) }
} else {
    Write-Host '  (none matched - your other Django app may be under a different name)'
}
if (Get-Service -Name 'CreativeSphere') {
    Report 'WARN' 'NSSM service name' "'CreativeSphere' already exists"
}

Section 'Firewall'

# Walking every rule and asking each for its ports takes minutes on a busy
# server. Start from the port filters instead - there are far fewer.
$openPorts = @()
foreach ($f in Get-NetFirewallPortFilter) {
    if ($f.LocalPort -in @('80', '443', 'Any')) {
        $r = $f | Get-NetFirewallRule
        if ($r.Enabled -eq 'True' -and $r.Direction -eq 'Inbound' -and $r.Action -eq 'Allow') {
            $openPorts += $f.LocalPort
        }
    }
}
foreach ($port in 80, 443) {
    if ($openPorts -contains "$port" -or $openPorts -contains 'Any') {
        Report 'OK' "Inbound $port" 'allowed'
    } else {
        Report 'WARN' "Inbound $port" 'no explicit rule - your other HTTPS sites suggest it is open anyway'
    }
}

# ---------------------------------------------------------------------- summary
Write-Host ''
Write-Host ('=' * 74) -ForegroundColor DarkGray
if ($script:Missing -eq 0) {
    Write-Host 'All prerequisites present. Review the collision warnings above, then' -ForegroundColor Green
    Write-Host 'continue from Step 2 of DEPLOY.md.' -ForegroundColor Green
} else {
    Write-Host "$($script:Missing) prerequisite(s) missing - install those first." -ForegroundColor Red
}
Write-Host ''
