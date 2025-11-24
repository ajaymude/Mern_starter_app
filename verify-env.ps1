# Environment Variables Verification Script
Write-Host "=== Environment Variables Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check Client .env.local
Write-Host "1. CLIENT Environment (client/.env.local):" -ForegroundColor Yellow
if (Test-Path "client\.env.local") {
    $clientEnv = Get-Content "client\.env.local" -Raw
    $clientId = ($clientEnv | Select-String -Pattern "VITE_GOOGLE_CLIENT_ID=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    
    if ($clientId -and $clientId -match "202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7") {
        Write-Host "   ✓ VITE_GOOGLE_CLIENT_ID is set correctly" -ForegroundColor Green
        Write-Host "     Value: $($clientId.Substring(0, [Math]::Min(50, $clientId.Length)))..." -ForegroundColor Gray
    } elseif ($clientId -and $clientId -match "your-google-client-id") {
        Write-Host "   ✗ VITE_GOOGLE_CLIENT_ID is still a placeholder" -ForegroundColor Red
        Write-Host "     Update it with your actual Google Client ID" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ VITE_GOOGLE_CLIENT_ID not found" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ client/.env.local does not exist" -ForegroundColor Red
    Write-Host "     Create it from client/env.example" -ForegroundColor Yellow
}

Write-Host ""

# Check Server .env
Write-Host "2. SERVER Environment (server/.env):" -ForegroundColor Yellow
if (Test-Path "server\.env") {
    $serverEnv = Get-Content "server\.env" -Raw
    $serverClientId = ($serverEnv | Select-String -Pattern "GOOGLE_CLIENT_ID=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    $serverClientSecret = ($serverEnv | Select-String -Pattern "GOOGLE_CLIENT_SECRET=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    
    if ($serverClientId -and $serverClientId -match "202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7") {
        Write-Host "   ✓ GOOGLE_CLIENT_ID is set correctly" -ForegroundColor Green
        Write-Host "     Value: $($serverClientId.Substring(0, [Math]::Min(50, $serverClientId.Length)))..." -ForegroundColor Gray
    } elseif ($serverClientId -and $serverClientId -match "your-google-client-id") {
        Write-Host "   ✗ GOOGLE_CLIENT_ID is still a placeholder" -ForegroundColor Red
    } else {
        Write-Host "   ✗ GOOGLE_CLIENT_ID not found" -ForegroundColor Red
    }
    
    if ($serverClientSecret -and $serverClientSecret -notmatch "your-google-client-secret") {
        Write-Host "   ✓ GOOGLE_CLIENT_SECRET is set" -ForegroundColor Green
    } else {
        Write-Host "   ✗ GOOGLE_CLIENT_SECRET is missing or placeholder" -ForegroundColor Red
    }
    
    # Check if Client IDs match
    if ($clientId -and $serverClientId -and $clientId -eq $serverClientId) {
        Write-Host "   ✓ Client and Server Client IDs match" -ForegroundColor Green
    } elseif ($clientId -and $serverClientId) {
        Write-Host "   ✗ Client and Server Client IDs do NOT match!" -ForegroundColor Red
        Write-Host "     They must be exactly the same" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ server/.env does not exist" -ForegroundColor Red
    Write-Host "     Create it from server/env.example" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Ensure both client/.env.local and server/.env have the same GOOGLE_CLIENT_ID" -ForegroundColor White
Write-Host "2. Restart the dev server: cd client && npm run dev" -ForegroundColor White
Write-Host "3. Check browser console for 'Google Client ID Environment Check' log" -ForegroundColor White

