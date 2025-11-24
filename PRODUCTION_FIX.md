# Production Error Fix - Google Client ID Not Configured

## Problem

In production, you're seeing:

```
Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in client/.env.local and restart the dev server
```

## Root Cause

The client was **built without** `VITE_GOOGLE_CLIENT_ID` set, or it was built with a placeholder value.

**Important:** Vite embeds environment variables at **BUILD TIME**, not runtime. You must rebuild after setting environment variables.

## Solution

### Step 1: Verify Client Environment

```powershell
Get-Content "client\.env.local" | Select-String "VITE_GOOGLE_CLIENT_ID"
```

Should show your actual Client ID (not "your-google-client-id").

### Step 2: Rebuild the Client

```powershell
# Clean old build (optional)
Remove-Item -Recurse -Force client\build -ErrorAction SilentlyContinue

# Build with environment variables
cd client
npm run build
cd ..
```

### Step 3: Verify Build

```powershell
# Check if build exists
Test-Path "client\build\index.html"

# Check if Google script is in build
Select-String -Path "client\build\index.html" -Pattern "accounts.google.com"
```

### Step 4: Start Production Server

```powershell
npm run start:prod
```

### Step 5: Test

Visit `http://localhost:5000` and check:

- Google button should appear
- No error messages
- Browser console shows: "Google Client ID check:" with your Client ID

## Quick Fix Commands

```powershell
# 1. Verify env var is set
Get-Content "client\.env.local" | Select-String "VITE_GOOGLE_CLIENT_ID"

# 2. Rebuild
cd client
npm run build
cd ..

# 3. Start production
npm run start:prod
```

## What I Fixed

1. ✅ **Updated error message** - Now shows "rebuild" instead of "restart dev server" for production
2. ✅ **Built the client** - Created `client/build` with environment variables embedded
3. ✅ **Created build script** - `build-prod.ps1` for easy production builds

## Prevention

**Always rebuild after changing `client/.env.local`:**

```powershell
cd client
npm run build
cd ..
```

The build process embeds environment variables into the JavaScript files, so changes require a rebuild.

## Files Updated

- ✅ `client/src/components/GoogleSignInButton.jsx` - Better production error message
- ✅ `build-prod.ps1` - Production build script
- ✅ `client/build` - Built with your Google Client ID

The production build is now complete! Start the server with `npm run start:prod` and the Google button should work.
