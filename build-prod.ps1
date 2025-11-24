# Production Build Script
# This script builds the client with production environment variables

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Production Build" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if client/.env.local exists
if (-not (Test-Path "client\.env.local")) {
    Write-Host "ERROR: client/.env.local not found!" -ForegroundColor Red
    Write-Host "Please create it from client/env.example and set VITE_GOOGLE_CLIENT_ID" -ForegroundColor Yellow
    exit 1
}

# Check if VITE_GOOGLE_CLIENT_ID is set
$envContent = Get-Content "client\.env.local" -Raw
if ($envContent -notmatch "VITE_GOOGLE_CLIENT_ID=.*" -or $envContent -match "VITE_GOOGLE_CLIENT_ID=your-google-client-id") {
    Write-Host "ERROR: VITE_GOOGLE_CLIENT_ID not set or is placeholder!" -ForegroundColor Red
    Write-Host "Please edit client/.env.local and set your actual Google Client ID" -ForegroundColor Yellow
    exit 1
}

# Extract Client ID for verification
$clientIdMatch = [regex]::Match($envContent, "VITE_GOOGLE_CLIENT_ID=(.+)")
if ($clientIdMatch.Success) {
    $clientId = $clientIdMatch.Groups[1].Value.Trim()
    Write-Host "✓ Found Google Client ID: $($clientId.Substring(0, [Math]::Min(30, $clientId.Length)))..." -ForegroundColor Green
} else {
    Write-Host "ERROR: Could not extract VITE_GOOGLE_CLIENT_ID" -ForegroundColor Red
    exit 1
}

# Check VITE_API_BASE_URL
if ($envContent -notmatch "VITE_API_BASE_URL=.*") {
    Write-Host "WARNING: VITE_API_BASE_URL not set. Adding default: /api/auth" -ForegroundColor Yellow
    Add-Content "client\.env.local" -Value "VITE_API_BASE_URL=/api/auth"
} else {
    $apiUrlMatch = [regex]::Match($envContent, "VITE_API_BASE_URL=(.+)")
    if ($apiUrlMatch.Success) {
        $apiUrl = $apiUrlMatch.Groups[1].Value.Trim()
        Write-Host "✓ API Base URL: $apiUrl" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Cleaning old build..." -ForegroundColor Yellow
if (Test-Path "client\build") {
    Remove-Item -Recurse -Force "client\build"
    Write-Host "✓ Removed old build" -ForegroundColor Green
}

Write-Host ""
Write-Host "Building client with production environment variables..." -ForegroundColor Yellow
Write-Host ""

# Build the client
Set-Location client
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Verify the build
Write-Host ""
Write-Host "Verifying build..." -ForegroundColor Yellow

if (Test-Path "client\build\index.html") {
    $buildHtml = Get-Content "client\build\index.html" -Raw
    if ($buildHtml -match "accounts\.google\.com/gsi/client") {
        Write-Host "✓ Google script tag found in build/index.html" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Google script tag not found in build!" -ForegroundColor Yellow
    }
    
    # Check if build contains the Client ID (basic check)
    $buildFiles = Get-ChildItem "client\build" -Recurse -Filter "*.js" | Select-Object -First 1
    if ($buildFiles) {
        $buildContent = Get-Content $buildFiles.FullName -Raw -ErrorAction SilentlyContinue
        if ($buildContent -and $buildContent -match $clientId.Substring(0, 20)) {
            Write-Host "✓ Client ID found in build files" -ForegroundColor Green
        } else {
            Write-Host "⚠ Could not verify Client ID in build (may be minified)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "ERROR: Build output not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start production server:" -ForegroundColor White
Write-Host "   npm run start:prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Visit: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Build output: client/build" -ForegroundColor Gray
Write-Host ""

