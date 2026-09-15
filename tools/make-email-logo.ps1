# Renders tools/make-email-logo.html in headless Edge and writes the PNG it
# produces to the repository root as email-logo.png â€” the path the auth email
# templates point at, and the path Cloudflare serves from.
#
#   powershell -ExecutionPolicy Bypass -File tools\make-email-logo.ps1
#
# Same Edge invocation as run-check.ps1, and for the same reasons: stdout does
# not reach the pipeline, so the DOM is redirected to a file and read back.
# The page writes the canvas out as bare base64 into <pre id="out">.

$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }

$root = Split-Path -Parent $PSScriptRoot
$url  = "file:///" + $root.Replace([char]92, [char]47) + "/tools/make-email-logo.html"
$ud   = Join-Path $env:TEMP ("edgelogo" + (Get-Random))
$dom  = Join-Path $env:TEMP ("dom" + (Get-Random) + ".html")
$out  = Join-Path $root "email-logo.png"

Start-Process -FilePath $edge -NoNewWindow -Wait -RedirectStandardOutput $dom -ArgumentList @(
  "--headless=new","--disable-gpu","--no-sandbox","--allow-file-access-from-files",
  "--user-data-dir=$ud","--virtual-time-budget=15000","--dump-dom",$url
)

$html = Get-Content $dom -Raw
Remove-Item $dom -ErrorAction SilentlyContinue
Remove-Item $ud -Recurse -Force -ErrorAction SilentlyContinue

if ($html -match '(?s)<pre id="out"[^>]*>(.*?)</pre>') {
  $b64 = $Matches[1].Trim()
  if ($b64.Length -lt 100) { Write-Output "FAIL - canvas produced nothing"; exit 1 }
  [IO.File]::WriteAllBytes($out, [Convert]::FromBase64String($b64))
  Write-Output "OK - wrote $out ($((Get-Item $out).Length) bytes)"
} else {
  Write-Output "FAIL - no #out block in the rendered page"; exit 1
}
