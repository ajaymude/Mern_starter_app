# Production Environment Setup Script
# This script helps you set up environment variables for production

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Production Environment Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will configure your app to serve the built client files on the server port." -ForegroundColor Yellow
Write-Host ""

# ============================================
# Step 1: Client Environment Setup
# ============================================
Write-Host "Step 1: Setting up CLIENT environment for production build..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path "client\.env.local")) {
    if (Test-Path "client\env.example") {
        Copy-Item "client\env.example" "client\.env.local"
        Write-Host "✓ Created client/.env.local from example" -ForegroundColor Green
    } else {
        Write-Host "ERROR: client/env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Get Google Client ID for client
Write-Host ""
Write-Host "Enter your Google OAuth Client ID:" -ForegroundColor Yellow
Write-Host "(Get from: https://console.cloud.google.com/apis/credentials)" -ForegroundColor Gray
$clientGoogleId = Read-Host "Google Client ID"

if ([string]::IsNullOrWhiteSpace($clientGoogleId)) {
    Write-Host "WARNING: Google Client ID not provided. You can set it later in client/.env.local" -ForegroundColor Yellow
} else {
    $clientEnvContent = Get-Content "client\.env.local" -Raw
    
    # Update Google Client ID
    if ($clientEnvContent -match "VITE_GOOGLE_CLIENT_ID=.*") {
        $clientEnvContent = $clientEnvContent -replace "VITE_GOOGLE_CLIENT_ID=.*", "VITE_GOOGLE_CLIENT_ID=$clientGoogleId"
    } else {
        $clientEnvContent = $clientEnvContent + "`nVITE_GOOGLE_CLIENT_ID=$clientGoogleId"
    }
    
    # Set API Base URL for production (same server)
    if ($clientEnvContent -match "VITE_API_BASE_URL=.*") {
        $clientEnvContent = $clientEnvContent -replace "VITE_API_BASE_URL=.*", "VITE_API_BASE_URL=/api/auth"
    } else {
        $clientEnvContent = $clientEnvContent + "`nVITE_API_BASE_URL=/api/auth"
    }
    
    Set-Content "client\.env.local" -Value $clientEnvContent -NoNewline
    Write-Host "✓ Updated client/.env.local for production" -ForegroundColor Green
    Write-Host "  - VITE_GOOGLE_CLIENT_ID set" -ForegroundColor Gray
    Write-Host "  - VITE_API_BASE_URL=/api/auth (same server)" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# Step 2: Server Environment Setup
# ============================================
Write-Host "Step 2: Setting up SERVER environment for production..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path "server\.env")) {
    if (Test-Path "server\env.example") {
        Copy-Item "server\env.example" "server\.env"
        Write-Host "✓ Created server/.env from example" -ForegroundColor Green
    } else {
        Write-Host "ERROR: server/env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Get server port
Write-Host ""
$serverPort = Read-Host "Server port (default: 5000)"
if ([string]::IsNullOrWhiteSpace($serverPort)) {
    $serverPort = "5000"
}

# Get server URL (for production)
Write-Host ""
Write-Host "Enter your production server URL:" -ForegroundColor Yellow
Write-Host "Example: http://localhost:5000 (for local) or https://yourdomain.com (for production)" -ForegroundColor Gray
$serverUrl = Read-Host "Server URL"

if ([string]::IsNullOrWhiteSpace($serverUrl)) {
    $serverUrl = "http://localhost:$serverPort"
    Write-Host "Using default: $serverUrl" -ForegroundColor Gray
}

# Get MongoDB URI
Write-Host ""
Write-Host "Enter your MongoDB connection URI:" -ForegroundColor Yellow
Write-Host "Local: mongodb://localhost:27017/mern-starter" -ForegroundColor Gray
Write-Host "Atlas: mongodb+srv://username:password@cluster.mongodb.net/mern-starter" -ForegroundColor Gray
$mongodbUri = Read-Host "MongoDB URI"

if ([string]::IsNullOrWhiteSpace($mongodbUri)) {
    $mongodbUri = "mongodb://localhost:27017/mern-starter"
    Write-Host "Using default: $mongodbUri" -ForegroundColor Gray
}

# Get JWT Secret
Write-Host ""
Write-Host "Enter your JWT Secret (minimum 32 characters):" -ForegroundColor Yellow
Write-Host "Generate one: openssl rand -base64 32" -ForegroundColor Gray
$jwtSecret = Read-Host "JWT Secret"

if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    $jwtSecret = "your-super-secret-jwt-key-change-this-in-production-min-32-characters"
    Write-Host "WARNING: Using placeholder JWT Secret. Please change it!" -ForegroundColor Yellow
}

# Get Google Client ID for server (must match client)
Write-Host ""
Write-Host "Enter your Google OAuth Client ID (must match client/.env.local):" -ForegroundColor Yellow
if (-not [string]::IsNullOrWhiteSpace($clientGoogleId)) {
    Write-Host "Client has: $($clientGoogleId.Substring(0, [Math]::Min(30, $clientGoogleId.Length)))..." -ForegroundColor Gray
    $useSame = Read-Host "Use the same Client ID? (y/n)"
    if ($useSame -eq "y" -or $useSame -eq "Y") {
        $serverGoogleId = $clientGoogleId
    } else {
        $serverGoogleId = Read-Host "Google Client ID"
    }
} else {
    $serverGoogleId = Read-Host "Google Client ID"
}

# Get Google Client Secret
Write-Host ""
Write-Host "Enter your Google OAuth Client Secret:" -ForegroundColor Yellow
$googleSecret = Read-Host "Google Client Secret"

# Read and update server .env
$serverEnvContent = Get-Content "server\.env" -Raw

# Update NODE_ENV
$serverEnvContent = $serverEnvContent -replace "NODE_ENV=.*", "NODE_ENV=production"
Write-Host "✓ Set NODE_ENV=production" -ForegroundColor Green

# Update PORT
$serverEnvContent = $serverEnvContent -replace "PORT=.*", "PORT=$serverPort"
Write-Host "✓ Set PORT=$serverPort" -ForegroundColor Green

# Update MONGODB_URI
$serverEnvContent = $serverEnvContent -replace "MONGODB_URI=.*", "MONGODB_URI=$mongodbUri"
Write-Host "✓ Set MONGODB_URI" -ForegroundColor Green

# Update JWT_SECRET
$serverEnvContent = $serverEnvContent -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
Write-Host "✓ Set JWT_SECRET" -ForegroundColor Green

# Update GOOGLE_CLIENT_ID
if ($serverEnvContent -match "GOOGLE_CLIENT_ID=.*") {
    $serverEnvContent = $serverEnvContent -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$serverGoogleId"
} else {
    $serverEnvContent = $serverEnvContent + "`nGOOGLE_CLIENT_ID=$serverGoogleId"
}
Write-Host "✓ Set GOOGLE_CLIENT_ID" -ForegroundColor Green

# Update GOOGLE_CLIENT_SECRET
if (-not [string]::IsNullOrWhiteSpace($googleSecret)) {
    if ($serverEnvContent -match "GOOGLE_CLIENT_SECRET=.*") {
        $serverEnvContent = $serverEnvContent -replace "GOOGLE_CLIENT_SECRET=.*", "GOOGLE_CLIENT_SECRET=$googleSecret"
    } else {
        $serverEnvContent = $serverEnvContent + "`nGOOGLE_CLIENT_SECRET=$googleSecret"
    }
    Write-Host "✓ Set GOOGLE_CLIENT_SECRET" -ForegroundColor Green
}

# Update FRONTEND_URL (should be same as server URL in production)
$serverEnvContent = $serverEnvContent -replace "FRONTEND_URL=.*", "FRONTEND_URL=$serverUrl"
Write-Host "✓ Set FRONTEND_URL=$serverUrl" -ForegroundColor Green

# Update CORS_ORIGIN (should be same as server URL in production)
$serverEnvContent = $serverEnvContent -replace "CORS_ORIGIN=.*", "CORS_ORIGIN=$serverUrl"
Write-Host "✓ Set CORS_ORIGIN=$serverUrl" -ForegroundColor Green

# Update GOOGLE_REDIRECT_URI
$redirectUri = "$serverUrl/api/auth/google/callback"
if ($serverEnvContent -match "GOOGLE_REDIRECT_URI=.*") {
    $serverEnvContent = $serverEnvContent -replace "GOOGLE_REDIRECT_URI=.*", "GOOGLE_REDIRECT_URI=$redirectUri"
} else {
    $serverEnvContent = $serverEnvContent + "`nGOOGLE_REDIRECT_URI=$redirectUri"
}
Write-Host "✓ Set GOOGLE_REDIRECT_URI=$redirectUri" -ForegroundColor Green

# Save server .env file
Set-Content "server\.env" -Value $serverEnvContent -NoNewline

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verify setup
Write-Host "Verifying setup..." -ForegroundColor Yellow
Write-Host ""

$clientIdCheck = Get-Content "client\.env.local" | Select-String "VITE_GOOGLE_CLIENT_ID"
$serverIdCheck = Get-Content "server\.env" | Select-String "GOOGLE_CLIENT_ID"

if ($clientIdCheck -and $serverIdCheck) {
    $clientId = ($clientIdCheck -split "=")[1].Trim()
    $serverId = ($serverIdCheck -split "=")[1].Trim()
    
    if ($clientId -eq $serverId -and -not $clientId.Contains("your-google-client-id")) {
        Write-Host "✓ Client IDs match!" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: Client IDs don't match or are placeholders!" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Files configured:" -ForegroundColor Yellow
Write-Host "  ✓ client/.env.local (with VITE_GOOGLE_CLIENT_ID and VITE_API_BASE_URL=/api/auth)" -ForegroundColor Green
Write-Host "  ✓ server/.env (with production values)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Build the client:" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Cyan
Write-Host "   npm run build" -ForegroundColor Cyan
Write-Host "   cd .." -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Start production server:" -ForegroundColor White
Write-Host "   npm run start:prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Visit: $serverUrl" -ForegroundColor White
Write-Host ""

