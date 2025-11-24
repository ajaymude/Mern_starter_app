# Fix Google Button - Restart Dev Server and Verify Setup
Write-Host "=== Fixing Google Sign-In Button ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists and has the correct value
Write-Host "1. Checking client/.env.local..." -ForegroundColor Yellow
if (Test-Path "client\.env.local") {
    $envContent = Get-Content "client\.env.local" -Raw
    if ($envContent -match "VITE_GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7\.apps\.googleusercontent\.com") {
        Write-Host "   ✓ VITE_GOOGLE_CLIENT_ID is set correctly" -ForegroundColor Green
    }
    else {
        Write-Host "   ✗ VITE_GOOGLE_CLIENT_ID might not be set correctly" -ForegroundColor Red
        Write-Host "   Please check client/.env.local" -ForegroundColor Yellow
    }
}
else {
    Write-Host "   ✗ client/.env.local not found!" -ForegroundColor Red
    Write-Host "   Creating client/.env.local..." -ForegroundColor Yellow
    @"
VITE_GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
VITE_API_BASE_URL=/api/auth
"@ | Out-File -FilePath "client\.env.local" -Encoding utf8
    Write-Host "   ✓ Created client/.env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.MainWindowTitle -like "*vite*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "3. To fix the Google button issue:" -ForegroundColor Cyan
Write-Host "   a) If running in DEVELOPMENT mode:" -ForegroundColor White
Write-Host "      - Stop the current dev server (Ctrl+C)" -ForegroundColor Gray
Write-Host "      - Run: cd client && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   b) If running in PRODUCTION mode:" -ForegroundColor White
Write-Host "      - Run: cd client && npm run build" -ForegroundColor Gray
Write-Host "      - Then restart your production server" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Check the browser console (F12) for:" -ForegroundColor Cyan
Write-Host "   - 'Google Client ID Environment Check:' log" -ForegroundColor Gray
Write-Host "   - 'Google Client ID is valid, proceeding with initialization...'" -ForegroundColor Gray
Write-Host "   - 'Google button rendered successfully'" -ForegroundColor Gray
Write-Host ""
Write-Host "5. If you see an error message instead of the button:" -ForegroundColor Cyan
Write-Host "   - Check the console for the specific error" -ForegroundColor Gray
Write-Host "   - Verify VITE_GOOGLE_CLIENT_ID is set in client/.env.local" -ForegroundColor Gray
Write-Host "   - Make sure you restarted the dev server after setting the env variable" -ForegroundColor Gray
Write-Host ""

