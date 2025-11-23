# Development Environment Setup Script
# This script helps you set up environment variables for development

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Development Environment Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Step 1: Client Environment Setup
# ============================================
Write-Host "Step 1: Setting up CLIENT environment..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "client\.env.local") {
    Write-Host "✓ client/.env.local already exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Skipping client environment setup" -ForegroundColor Gray
    } else {
        Write-Host "Updating client/.env.local..." -ForegroundColor Yellow
    }
} else {
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
    if ($clientEnvContent -match "VITE_GOOGLE_CLIENT_ID=.*") {
        $clientEnvContent = $clientEnvContent -replace "VITE_GOOGLE_CLIENT_ID=.*", "VITE_GOOGLE_CLIENT_ID=$clientGoogleId"
        Set-Content "client\.env.local" -Value $clientEnvContent -NoNewline
        Write-Host "✓ Updated VITE_GOOGLE_CLIENT_ID in client/.env.local" -ForegroundColor Green
    } else {
        Add-Content "client\.env.local" -Value "`nVITE_GOOGLE_CLIENT_ID=$clientGoogleId"
        Write-Host "✓ Added VITE_GOOGLE_CLIENT_ID to client/.env.local" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Client environment setup complete!" -ForegroundColor Green
Write-Host ""

# ============================================
# Step 2: Server Environment Setup
# ============================================
Write-Host "Step 2: Setting up SERVER environment..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "server\.env") {
    Write-Host "✓ server/.env already exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Skipping server environment setup" -ForegroundColor Gray
        exit 0
    } else {
        Write-Host "Updating server/.env..." -ForegroundColor Yellow
    }
} else {
    if (Test-Path "server\env.example") {
        Copy-Item "server\env.example" "server\.env"
        Write-Host "✓ Created server/.env from example" -ForegroundColor Green
    } else {
        Write-Host "ERROR: server/env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Update NODE_ENV to development
$serverEnvContent = Get-Content "server\.env" -Raw
if ($serverEnvContent -match "NODE_ENV=.*") {
    $serverEnvContent = $serverEnvContent -replace "NODE_ENV=.*", "NODE_ENV=development"
} else {
    $serverEnvContent = "NODE_ENV=development`n" + $serverEnvContent
}
Write-Host "✓ Set NODE_ENV=development" -ForegroundColor Green

# Get MongoDB URI
Write-Host ""
Write-Host "Enter your MongoDB connection URI:" -ForegroundColor Yellow
Write-Host "Local: mongodb://localhost:27017/mern-starter" -ForegroundColor Gray
Write-Host "Atlas: mongodb+srv://username:password@cluster.mongodb.net/mern-starter" -ForegroundColor Gray
$mongodbUri = Read-Host "MongoDB URI (or press Enter for default: mongodb://localhost:27017/mern-starter)"

if ([string]::IsNullOrWhiteSpace($mongodbUri)) {
    $mongodbUri = "mongodb://localhost:27017/mern-starter"
    Write-Host "Using default: $mongodbUri" -ForegroundColor Gray
}

if ($serverEnvContent -match "MONGODB_URI=.*") {
    $serverEnvContent = $serverEnvContent -replace "MONGODB_URI=.*", "MONGODB_URI=$mongodbUri"
} else {
    $serverEnvContent = $serverEnvContent + "`nMONGODB_URI=$mongodbUri"
}
Write-Host "✓ Set MONGODB_URI" -ForegroundColor Green

# Get JWT Secret
Write-Host ""
Write-Host "Enter your JWT Secret (minimum 32 characters):" -ForegroundColor Yellow
Write-Host "Generate one: openssl rand -base64 32" -ForegroundColor Gray
$jwtSecret = Read-Host "JWT Secret"

if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    $jwtSecret = "your-super-secret-jwt-key-change-this-in-production-min-32-characters"
    Write-Host "WARNING: Using placeholder JWT Secret. Please change it!" -ForegroundColor Yellow
}

if ($jwtSecret.Length -lt 32) {
    Write-Host "WARNING: JWT Secret is less than 32 characters. Please use a stronger secret!" -ForegroundColor Yellow
}

if ($serverEnvContent -match "JWT_SECRET=.*") {
    $serverEnvContent = $serverEnvContent -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
} else {
    $serverEnvContent = $serverEnvContent + "`nJWT_SECRET=$jwtSecret"
}
Write-Host "✓ Set JWT_SECRET" -ForegroundColor Green

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

if ([string]::IsNullOrWhiteSpace($serverGoogleId)) {
    Write-Host "WARNING: Google Client ID not provided. You can set it later in server/.env" -ForegroundColor Yellow
} else {
    if ($serverEnvContent -match "GOOGLE_CLIENT_ID=.*") {
        $serverEnvContent = $serverEnvContent -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$serverGoogleId"
    } else {
        $serverEnvContent = $serverEnvContent + "`nGOOGLE_CLIENT_ID=$serverGoogleId"
    }
    Write-Host "✓ Set GOOGLE_CLIENT_ID" -ForegroundColor Green
}

# Get Google Client Secret
Write-Host ""
Write-Host "Enter your Google OAuth Client Secret:" -ForegroundColor Yellow
Write-Host "(Get from: https://console.cloud.google.com/apis/credentials)" -ForegroundColor Gray
$googleSecret = Read-Host "Google Client Secret"

if ([string]::IsNullOrWhiteSpace($googleSecret)) {
    Write-Host "WARNING: Google Client Secret not provided. You can set it later in server/.env" -ForegroundColor Yellow
} else {
    if ($serverEnvContent -match "GOOGLE_CLIENT_SECRET=.*") {
        $serverEnvContent = $serverEnvContent -replace "GOOGLE_CLIENT_SECRET=.*", "GOOGLE_CLIENT_SECRET=$googleSecret"
    } else {
        $serverEnvContent = $serverEnvContent + "`nGOOGLE_CLIENT_SECRET=$googleSecret"
    }
    Write-Host "✓ Set GOOGLE_CLIENT_SECRET" -ForegroundColor Green
}

# Set CORS_ORIGIN for development
if ($serverEnvContent -match "CORS_ORIGIN=.*") {
    $serverEnvContent = $serverEnvContent -replace "CORS_ORIGIN=.*", "CORS_ORIGIN=http://localhost:3000"
} else {
    $serverEnvContent = $serverEnvContent + "`nCORS_ORIGIN=http://localhost:3000"
}
Write-Host "✓ Set CORS_ORIGIN=http://localhost:3000" -ForegroundColor Green

# Set FRONTEND_URL for development
if ($serverEnvContent -match "FRONTEND_URL=.*") {
    $serverEnvContent = $serverEnvContent -replace "FRONTEND_URL=.*", "FRONTEND_URL=http://localhost:3000"
} else {
    $serverEnvContent = $serverEnvContent + "`nFRONTEND_URL=http://localhost:3000"
}
Write-Host "✓ Set FRONTEND_URL=http://localhost:3000" -ForegroundColor Green

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
        Write-Host "  Client: $($clientId.Substring(0, [Math]::Min(30, $clientId.Length)))..." -ForegroundColor Gray
        Write-Host "  Server: $($serverId.Substring(0, [Math]::Min(30, $serverId.Length)))..." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Files created/updated:" -ForegroundColor Yellow
Write-Host "  ✓ client/.env.local" -ForegroundColor Green
Write-Host "  ✓ server/.env" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Start the development servers:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Visit: http://localhost:3000" -ForegroundColor White
Write-Host ""

