# Clean up environment files
Write-Host "=== Cleaning Environment Files ===" -ForegroundColor Cyan
Write-Host ""

# Clean server/.env
Write-Host "1. Cleaning server/.env..." -ForegroundColor Yellow
$serverEnv = @"
NODE_ENV=production
PORT=5000

# =========================
# Database
# =========================
MONGODB_URI=mongodb://localhost:27017/mern-starter
MONGODB_READ_PREFERENCE=primary

# =========================
# JWT
# =========================
# MUST be at least 32 characters
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
JWT_COOKIE_EXPIRE=7
JWT_REFRESH_COOKIE_EXPIRE=30

# =========================
# CORS / Frontend (PRODUCTION)
# =========================
# MUST be the server URL (not 3000)
CORS_ORIGIN=http://localhost:5000
FRONTEND_URL=http://localhost:5000

# =========================
# Google OAuth
# =========================
# MUST exactly match VITE_GOOGLE_CLIENT_ID in client/.env.local
GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# =========================
# Logging
# =========================
LOG_LEVEL=info

# =========================
# Performance
# =========================
REQUEST_TIMEOUT=30000
MAX_REQUEST_SIZE=10kb
SLOW_REQUEST_THRESHOLD_MS=1000
VERY_SLOW_REQUEST_THRESHOLD_MS=5000

# =========================
# MongoDB (optional tuning)
# =========================
MONGODB_MAX_POOL_SIZE=100
MONGODB_MIN_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
MONGODB_SOCKET_TIMEOUT_MS=45000
MONGODB_CONNECT_TIMEOUT_MS=10000
MONGODB_FAMILY=4
MONGODB_W=majority
MONGODB_WTIMEOUT_MS=5000
MONGODB_RETRY_WRITES=true
"@

$serverEnv | Out-File -FilePath "server\.env" -Encoding utf8
Write-Host "   Cleaned server/.env" -ForegroundColor Green

# Clean client/.env.local
Write-Host ""
Write-Host "2. Cleaning client/.env.local..." -ForegroundColor Yellow
$clientEnv = @"
VITE_GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
VITE_API_BASE_URL=/api/auth
"@

$clientEnv | Out-File -FilePath "client\.env.local" -Encoding utf8
Write-Host "   Cleaned client/.env.local" -ForegroundColor Green

# Remove client/.env if it exists (should use .env.local instead)
Write-Host ""
Write-Host "3. Checking for client/.env..." -ForegroundColor Yellow
if (Test-Path "client\.env") {
    Write-Host "   Found client/.env - removing (should use .env.local instead)" -ForegroundColor Yellow
    Remove-Item "client\.env" -Force
    Write-Host "   Removed client/.env" -ForegroundColor Green
}
else {
    Write-Host "   client/.env does not exist (correct)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Verification ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server .env variables:" -ForegroundColor Yellow
Get-Content "server\.env" | Select-String -Pattern "^[^#]" | Select-Object -First 5
Write-Host ""
Write-Host "Client .env.local variables:" -ForegroundColor Yellow
Get-Content "client\.env.local" | Select-String -Pattern "^[^#]"
Write-Host ""
Write-Host "Environment files cleaned successfully!" -ForegroundColor Green
Write-Host "IMPORTANT: Restart your dev server after this change!" -ForegroundColor Red

