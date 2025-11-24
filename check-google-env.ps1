# Check Google OAuth Environment Variables
Write-Host "=== Google OAuth Environment Check ===" -ForegroundColor Cyan
Write-Host ""

# Check client/.env.local
Write-Host "1. Checking client/.env.local..." -ForegroundColor Yellow
if (Test-Path "client\.env.local") {
    Write-Host "   ✓ File exists" -ForegroundColor Green
    $clientId = Get-Content "client\.env.local" | Select-String "VITE_GOOGLE_CLIENT_ID"
    if ($clientId) {
        $value = ($clientId -split "=")[1].Trim()
        if ($value -and $value -ne "your-google-client-id.apps.googleusercontent.com" -and $value.Length -gt 20) {
            Write-Host "   ✓ VITE_GOOGLE_CLIENT_ID is set: $($value.Substring(0, 30))..." -ForegroundColor Green
        } else {
            Write-Host "   ✗ VITE_GOOGLE_CLIENT_ID is placeholder or empty" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✗ VITE_GOOGLE_CLIENT_ID not found in file" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ File does not exist" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Checking server/.env..." -ForegroundColor Yellow
if (Test-Path "server\.env") {
    Write-Host "   ✓ File exists" -ForegroundColor Green
    $serverClientId = Get-Content "server\.env" | Select-String "GOOGLE_CLIENT_ID"
    $serverClientSecret = Get-Content "server\.env" | Select-String "GOOGLE_CLIENT_SECRET"
    if ($serverClientId) {
        $value = ($serverClientId -split "=")[1].Trim()
        if ($value -and $value -ne "your-google-client-id.apps.googleusercontent.com" -and $value.Length -gt 20) {
            Write-Host "   ✓ GOOGLE_CLIENT_ID is set: $($value.Substring(0, 30))..." -ForegroundColor Green
        } else {
            Write-Host "   ✗ GOOGLE_CLIENT_ID is placeholder or empty" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✗ GOOGLE_CLIENT_ID not found" -ForegroundColor Red
    }
    if ($serverClientSecret) {
        $value = ($serverClientSecret -split "=")[1].Trim()
        if ($value -and $value.Length -gt 20) {
            Write-Host "   ✓ GOOGLE_CLIENT_SECRET is set" -ForegroundColor Green
        } else {
            Write-Host "   ✗ GOOGLE_CLIENT_SECRET is placeholder or empty" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✗ GOOGLE_CLIENT_SECRET not found" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ File does not exist" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Recommendations:" -ForegroundColor Yellow
Write-Host "   - If running dev server: Restart it after setting env vars" -ForegroundColor White
Write-Host "   - If running production: Rebuild client with: cd client && npm run build" -ForegroundColor White
Write-Host "   - Check browser console for 'Google Client ID Environment Check' log" -ForegroundColor White
Write-Host ""

