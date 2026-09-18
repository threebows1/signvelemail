# Renders tools/make-sample-logo.html in headless Edge and writes the lockup to
# the repository root as sample-logo.png — the logo every signature shows until
# somebody uploads their own.
#
#   powershell -ExecutionPolicy Bypass -File tools\make-sample-logo.ps1
#   powershell -ExecutionPolicy Bypass -File tools\make-sample-logo.ps1 -H 180
#
# Same Edge invocation as run-check.ps1, and for the same reason: stdout does
# not reach the pipeline, so the DOM is redirected to a file and read back.
# The page writes the canvas out as bare base64 into <pre id="out">.
#
# The virtual time budget is deliberately generous: the wordmark is Manrope
# pulled from Google Fonts, and a canvas drawn before the face arrives is
# silently set in a system sans instead.
param(
  [int]$H = 0,
  [string]$Name = 'sample-logo.png'
)

$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }

$root = Split-Path -Parent $PSScriptRoot
$qs = ''
if ($H -gt 0) { $qs = "?h=$H" }

$url = "file:///" + $root.Replace([char]92, [char]47) + "/tools/make-sample-logo.html" + $qs
$ud  = Join-Path $env:TEMP ("edgelogo" + (Get-Random))
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
} else {
  Write-Output "FAIL - no #out block in the rendered page"; exit 1
}
