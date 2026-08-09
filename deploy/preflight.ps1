<#
    Pre-deployment audit for the Windows VM.

    Reports what is already installed, and — because this machine already runs
    other projects — surveys what is already using the ports and hostnames this
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

if (Test-Path (Join-Path $inetsrv 'requestRouter.dll')) {
    Report 'OK' 'ARR' 'module present'
} else {
    Report 'MISSING' 'ARR' 'iis.net/downloads/microsoft/application-request-routing'
}

# ARR proxy must be switched on at server level, separately from installing it
$proxy = Get-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' `
            -Filter 'system.webServer/proxy' -Name 'enabled'
if ($proxy -and $proxy.Value -eq $true) {
    Report 'OK' 'ARR proxy enabled' 'server-level proxy is on'
} else {
    Report 'MISSING' 'ARR proxy enabled' 'IIS Manager > server > ARR Cache > Proxy > Enable proxy'
}

function Probe {
    param([string]$Label, [string]$Exe, [string]$Args, [string]$Hint)
    $cmd = Get-Command $Exe
    if (-not $cmd) { Report 'MISSING' $Label $Hint; return $null }
    $out = (& $Exe $Args.Split(' ') 2>&1 | Select-Object -First 1)
    Report 'OK' $Label "$out"
    return "$out"
}

$py = Probe 'Python' 'python' '--version' 'python.org/downloads/windows (tick Add to PATH)'
if ($py -match '(\d+)\.(\d+)') {
    if ([int]$Matches[1] -lt 3 -or ([int]$Matches[1] -eq 3 -and [int]$Matches[2] -lt 12)) {
        Report 'WARN' 'Python version' 'this project expects 3.12 or newer'
    }
}

Probe 'Node.js' 'node' '--version' 'nodejs.org (or build dist on your Mac and copy it)' | Out-Null
Probe 'npm'     'npm'  '--version' 'ships with Node.js'                                 | Out-Null
Probe 'Git'     'git'  '--version' 'git-scm.com/download/win'                           | Out-Null

if (Get-Command nssm) { Report 'OK' 'NSSM' 'on PATH' }
else { Report 'MISSING' 'NSSM' 'nssm.cc/download, copy nssm.exe into System32' }

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
            $label = if ($hostHeader) { $hostHeader } else { '(no host header - CATCHES EVERYTHING)' }
            Write-Host ("      {0,-10} {1}" -f $b.protocol, $label) -ForegroundColor DarkGray
        }
    }
    Write-Host ''
    Write-Host '  A site bound to port 80 with NO host header will answer requests meant' -ForegroundColor Yellow
    Write-Host '  for dcreativesphere.com. Give every site an explicit host header rather' -ForegroundColor Yellow
    Write-Host '  than stopping one — another project is probably using it.' -ForegroundColor Yellow

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

foreach ($port in 80, 443) {
    $rule = Get-NetFirewallRule -Enabled True -Direction Inbound |
        Where-Object { ($_ | Get-NetFirewallPortFilter).LocalPort -eq $port }
    if ($rule) { Report 'OK' "Inbound $port" 'allowed' }
    else { Report 'WARN' "Inbound $port" 'no rule found - may still be covered by a broader rule' }
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
