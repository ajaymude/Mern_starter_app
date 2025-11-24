# Fix Google Environment Variables
Write-Host "=== Fixing Google Sign-In Environment ===" -ForegroundColor Cyan
Write-Host ""

# Clean up .env.local file
Write-Host "1. Cleaning up client/.env.local..." -ForegroundColor Yellow
$envPath = "client\.env.local"

if (Test-Path $envPath) {
    # Read current content
    $content = Get-Content $envPath
    
    # Filter out commented lines and empty lines, keep only active variables
    $cleanContent = @()
    $cleanContent += "VITE_GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com"
    $cleanContent += "VITE_API_BASE_URL=/api/auth"
    
    # Write clean content
    $cleanContent | Out-File -FilePath $envPath -Encoding utf8
    
    Write-Host "   Cleaned up .env.local" -ForegroundColor Green
}
else {
    Write-Host "   Creating new .env.local..." -ForegroundColor Yellow
    @"
VITE_GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
VITE_API_BASE_URL=/api/auth
"@ | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "   Created .env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Verifying .env.local content..." -ForegroundColor Yellow
Get-Content $envPath | ForEach-Object {
    if ($_ -match "VITE_GOOGLE_CLIENT_ID") {
        Write-Host "   Found: $_" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3. IMPORTANT: Restart your dev server!" -ForegroundColor Red
Write-Host "   Vite only reads .env.local when it starts." -ForegroundColor Yellow
Write-Host ""
Write-Host "   To restart:" -ForegroundColor Cyan
Write-Host "   1. Stop the current dev server (Ctrl+C)" -ForegroundColor White
Write-Host "   2. Run: npm run dev" -ForegroundColor White
Write-Host "   OR if running separately:" -ForegroundColor White
Write-Host "   2. Run: cd client; npm run dev" -ForegroundColor White
Write-Host ""

