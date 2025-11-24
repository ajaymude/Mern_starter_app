# Production Setup Guide

This guide helps you set up the application to serve the built client files on the server port in production mode.

## Overview

In production:

- **Client** is built into static files (`client/build`)
- **Server** serves both:
  - API routes at `/api/*`
  - Static client files at `/*` (all other routes)
- Everything runs on **one port** (default: 5000)

## Quick Setup

### Option 1: Automated Script (Recommended)

```powershell
.\setup-prod-env.ps1
```

This script will:

- ✅ Set up `client/.env.local` with production values
- ✅ Set up `server/.env` with production values
- ✅ Configure `VITE_API_BASE_URL=/api/auth` (same server)
- ✅ Configure `FRONTEND_URL` and `CORS_ORIGIN` to server URL
- ✅ Verify Client IDs match

### Option 2: Manual Setup

Follow the steps below.

---

## Step-by-Step Manual Setup

### Step 1: Client Environment for Production Build

**File:** `client/.env.local`

```env
# Google OAuth Client ID (REQUIRED)
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com

# API Base URL - Use relative path since same server
VITE_API_BASE_URL=/api/auth

# Other values can stay as default
VITE_PORT=3000
VITE_API_TARGET=http://localhost:5000
```

**Important:**

- `VITE_API_BASE_URL=/api/auth` - This tells the client to use the same server for API calls
- `VITE_GOOGLE_CLIENT_ID` - Must be your actual Client ID (not placeholder)

### Step 2: Server Environment for Production

**File:** `server/.env`

```env
# Basic Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=your-mongodb-connection-string

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS & Frontend (IMPORTANT: Set to server URL, not 3000!)
FRONTEND_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5000

# Google OAuth (MUST match client/.env.local)
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Logging
LOG_LEVEL=info
```

**Important:**

- `FRONTEND_URL` - Should be the server URL (e.g., `http://localhost:5000` or `https://yourdomain.com`)
- `CORS_ORIGIN` - Should match `FRONTEND_URL` (same server)
- `GOOGLE_CLIENT_ID` - Must **exactly match** `VITE_GOOGLE_CLIENT_ID` in `client/.env.local`

### Step 3: Build the Client

**This step is CRITICAL!** The client must be built with the environment variables set:

```powershell
# Make sure client/.env.local has your values
cd client
npm run build
cd ..
```

This creates `client/build` folder with production files.

**Why this matters:**

- Vite embeds `VITE_GOOGLE_CLIENT_ID` and `VITE_API_BASE_URL` into the JavaScript at **build time**
- If you build without these set, the app won't work correctly in production

### Step 4: Start Production Server

```powershell
npm run start:prod
```

This will:

- Set `NODE_ENV=production`
- Start server on port 5000 (or your configured port)
- Serve static files from `client/build`
- Serve API routes at `/api/*`

### Step 5: Access the Application

Visit: `http://localhost:5000` (or your configured server URL)

The server will:

- Serve the React app for all routes except `/api/*`
- Serve API endpoints at `/api/*`

---

## Production Configuration Summary

### Client Configuration (`client/.env.local`)

```env
# For production build (same server setup)
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=/api/auth  # Relative path - same server
```

### Server Configuration (`server/.env`)

```env
# Production mode
NODE_ENV=production
PORT=5000

# Frontend and CORS (same as server URL)
FRONTEND_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5000

# Google OAuth (must match client)
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Database and JWT
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret-min-32-chars
```

---

## Production Workflow

```powershell
# 1. Set up environment variables
.\setup-prod-env.ps1

# 2. Build the client (with env vars set)
cd client
npm run build
cd ..

# 3. Start production server
npm run start:prod

# 4. Visit http://localhost:5000
```

---

## How It Works

### Development Mode

```
Client (port 3000) → Vite Dev Server → Proxy → Server (port 5000)
```

### Production Mode

```
Browser → Server (port 5000) → Serves:
  - Static files (React app) for /*
  - API routes for /api/*
```

### Server Routing Logic

```javascript
// API routes first
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Then static files (in production)
if (NODE_ENV === "production") {
  app.use(express.static("client/build"));

  // Catch-all: serve index.html for React Router
  app.get("*", (req, res) => {
    res.sendFile("client/build/index.html");
  });
}
```

---

## Important Notes

1. **Build Before Starting:**

   - Always build the client (`npm run build`) before starting production server
   - Environment variables are embedded at build time

2. **Client IDs Must Match:**

   - `VITE_GOOGLE_CLIENT_ID` in `client/.env.local`
   - `GOOGLE_CLIENT_ID` in `server/.env`
   - Must be **exactly the same**

3. **URLs Should Match:**

   - `FRONTEND_URL` = Server URL
   - `CORS_ORIGIN` = Server URL
   - `GOOGLE_REDIRECT_URI` = Server URL + `/api/auth/google/callback`

4. **API Base URL:**
   - Use `/api/auth` (relative) when same server
   - Use full URL only if separate API server

---

## Troubleshooting

### Issue: "Can't find /api/login on this server!"

**Cause:** `VITE_API_BASE_URL` not set correctly during build

**Fix:**

1. Check `client/.env.local` has `VITE_API_BASE_URL=/api/auth`
2. Rebuild: `cd client && npm run build`
3. Restart server

### Issue: Google Button Not Showing

**Cause:** Client built without `VITE_GOOGLE_CLIENT_ID`

**Fix:**

1. Check `client/.env.local` has actual Client ID
2. Rebuild: `cd client && npm run build`
3. Restart server

### Issue: CORS Errors

**Cause:** `CORS_ORIGIN` doesn't match actual server URL

**Fix:**

1. Update `server/.env`: `CORS_ORIGIN=http://localhost:5000`
2. Restart server

---

## Checklist

Before deploying to production:

- [ ] `client/.env.local` has `VITE_GOOGLE_CLIENT_ID` (actual value)
- [ ] `client/.env.local` has `VITE_API_BASE_URL=/api/auth`
- [ ] `server/.env` has `NODE_ENV=production`
- [ ] `server/.env` has `GOOGLE_CLIENT_ID` (matches client)
- [ ] `server/.env` has `FRONTEND_URL` (server URL)
- [ ] `server/.env` has `CORS_ORIGIN` (server URL)
- [ ] Client built: `cd client && npm run build`
- [ ] `client/build` folder exists
- [ ] Server starts without errors
- [ ] Application accessible at server URL

---

## Files Updated

- ✅ `setup-prod-env.ps1` - Automated production setup script
- ✅ `PRODUCTION_SETUP.md` - Complete production guide
- ✅ `server/env.example` - Production-ready example
- ✅ `client/env.example` - Production-ready example
