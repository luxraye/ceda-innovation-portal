# Sky - one-step local setup for Windows PowerShell.
# Run from the project folder:  .\setup.ps1
$ErrorActionPreference = "Stop"
Write-Host "`n=== Sky: CEDA Innovation Portal setup ===`n" -ForegroundColor Cyan

$node = node --version 2>$null
if (-not $node) { Write-Host "Node.js 20 or newer is required: https://nodejs.org" -ForegroundColor Red; exit 1 }
Write-Host "Node $node found" -ForegroundColor Green

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $key = ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
  $secret = [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
  (Get-Content ".env") -replace '^AUTH_SECRET=.*', "AUTH_SECRET=`"$secret`"" -replace '^FILE_ENCRYPTION_KEY=.*', "FILE_ENCRYPTION_KEY=`"$key`"" | Set-Content ".env"
  Write-Host "Created .env with fresh secrets" -ForegroundColor Green
}

npm install
if ($LASTEXITCODE -ne 0) { exit 1 }
npm run setup
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`nReady. Start Sky with:  npm run dev" -ForegroundColor Cyan
Write-Host "Then open http://localhost:3000  (demo password: SkyDemo2026!)`n" -ForegroundColor Cyan
