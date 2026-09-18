# Renders tools/make-headshot.html in headless Edge and writes the square crop
# to the repository root as admin-portrait.jpg — the portrait the editor offers
# to an administrator in the Media section.
#
#   powershell -ExecutionPolicy Bypass -File tools\make-headshot.ps1
#   powershell -ExecutionPolicy Bypass -File tools\make-headshot.ps1 -X 2295 -Y 480 -S 2200
#
# Put the original at tools\source-portrait.jpg first. The crop box is in that
# image's own pixels; the defaults live in the page and are framed for the
# 8192x5464 office portrait this was written for.
#
# Same Edge invocation as run-check.ps1, and for the same reason: stdout does
# not reach the pipeline, so the DOM is redirected to a file and read back.
# The page writes the canvas out as bare base64 into <pre id="out">.
param(
  [int]$X = 0,
  [int]$Y = 0,
  [int]$S = 0,
  [double]$Q = 0,
  [string]$Name = 'admin-portrait.jpg'
)

$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }

$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root "tools\source-portrait.jpg"
if (-not (Test-Path $src)) {
  Write-Output "FAIL - no source image. Save the original as tools\source-portrait.jpg first."
  exit 1
}

# Only the values actually passed are sent on, so the page keeps its own
# defaults for the rest.
$query = @()
if ($X -gt 0) { $query += "x=$X" }
if ($Y -gt 0) { $query += "y=$Y" }
if ($S -gt 0) { $query += "s=$S" }
if ($Q -gt 0) { $query += "q=$Q" }
$qs = ''
if ($query.Count) { $qs = '?' + ($query -join '&') }

$url = "file:///" + $root.Replace([char]92, [char]47) + "/tools/make-headshot.html" + $qs
$ud  = Join-Path $env:TEMP ("edgeshot" + (Get-Random))
$dom = Join-Path $env:TEMP ("dom" + (Get-Random) + ".html")
$out = Join-Path $root $Name

Start-Process -FilePath $edge -NoNewWindow -Wait -RedirectStandardOutput $dom -ArgumentList @(
  "--headless=new","--disable-gpu","--no-sandbox","--allow-file-access-from-files",
  "--user-data-dir=$ud","--virtual-time-budget=20000","--dump-dom",$url
)

$html = Get-Content $dom -Raw
Remove-Item $dom -ErrorAction SilentlyContinue
Remove-Item $ud -Recurse -Force -ErrorAction SilentlyContinue

if ($html -match '<title>(.*?)</title>') { Write-Output "TITLE: $($Matches[1])" }

if ($html -match '(?s)<pre id="out"[^>]*>(.*?)</pre>') {
  $b64 = $Matches[1].Trim()
  if ($b64.Length -lt 100) { Write-Output "FAIL - canvas produced nothing"; exit 1 }
  [IO.File]::WriteAllBytes($out, [Convert]::FromBase64String($b64))
  $kb = [math]::Round((Get-Item $out).Length / 1KB, 1)
  Write-Output "OK - wrote $out ($kb KB)"
  # Email weight is the reason this is a JPEG at all; say so when it creeps up.
  if ($kb -gt 120) { Write-Output "NOTE - over 120 KB. Lower the quality: -Q 0.78" }
} else {
  Write-Output "FAIL - no #out block in the rendered page"; exit 1
}
