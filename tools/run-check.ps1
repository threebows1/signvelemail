# Runs one harness in headless Edge and prints its title and report block.
#
#   powershell -File tools\run-check.ps1 home-check.html
#
# Edge's stdout does not reach PowerShell's pipeline when it is launched with
# the call operator here, so the DOM is redirected to a file and read back.
param([string]$Page = 'home-check.html', [int]$Budget = 15000)

$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }

$root = Split-Path -Parent $PSScriptRoot
$url  = "file:///" + ($root -replace '\\','/') + "/tools/$Page"
$ud   = Join-Path $env:TEMP ("edgechk" + (Get-Random))
$dom  = Join-Path $env:TEMP ("dom" + (Get-Random) + ".html")

Start-Process -FilePath $edge -NoNewWindow -Wait -RedirectStandardOutput $dom -ArgumentList @(
  "--headless=new","--disable-gpu","--no-sandbox","--allow-file-access-from-files",
  "--user-data-dir=$ud","--virtual-time-budget=$Budget","--dump-dom",$url
)

$html = Get-Content $dom -Raw
if ($html -match '<title>(.*?)</title>') { Write-Output "TITLE: $($Matches[1])" } else { Write-Output "TITLE: (none)" }
if ($html -match '(?s)<pre id="out">(.*?)</pre>') { Write-Output "----"; Write-Output $Matches[1].Trim() }

Remove-Item $dom -ErrorAction SilentlyContinue
Remove-Item $ud -Recurse -Force -ErrorAction SilentlyContinue
