# Development Environment Setup - Step by Step

This guide will help you set up environment variables for **development** mode.

## Prerequisites

- Node.js installed
- MongoDB running (local or Atlas)
- Google OAuth credentials (if using Google Sign-In)

---

## Step 1: Client Environment Setup

### 1.1 Create Client Environment File

```powershell
# Navigate to client directory
cd client

# Copy the example file
Copy-Item env.example .env.local

# Go back to root
cd ..
```

### 1.2 Edit Client Environment File

Open `client/.env.local` and set these values:

```env
# Google OAuth Client ID (REQUIRED for Google Sign-In)
# Get from: https://console.cloud.google.com/apis/credentials
# Example: 202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# API Base URL (for development, leave as default)
VITE_API_BASE_URL=/api/auth

# Development Server Port (default: 3000)
VITE_PORT=3000

# API Target for Vite Proxy (default: http://localhost:5000)
VITE_API_TARGET=http://localhost:5000
```

**Important:** Replace `your-google-client-id.apps.googleusercontent.com` with your actual Google Client ID!

---

## Step 2: Server Environment Setup

### 2.1 Create Server Environment File

```powershell
# Navigate to server directory
cd server

# Copy the example file
Copy-Item env.example .env

# Go back to root
cd ..
```

### 2.2 Edit Server Environment File

Open `server/.env` and set these **required** values:

```env
# Environment (set to development)
NODE_ENV=development

# Server Port
PORT=5000

# MongoDB Connection URI
# Local: mongodb://localhost:27017/mern-starter
# Atlas: mongodb+srv://username:password@cluster.mongodb.net/mern-starter
MONGODB_URI=mongodb://localhost:27017/mern-starter

# JWT Secret (MUST be at least 32 characters!)
# Generate one: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-characters

# JWT Expiration
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS Origin (your frontend URL)
CORS_ORIGIN=http://localhost:3000

# Google OAuth Configuration
# MUST match VITE_GOOGLE_CLIENT_ID in client/.env.local
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important:**

- Replace `your-google-client-id.apps.googleusercontent.com` with your actual Google Client ID
- Replace `your-google-client-secret` with your actual Google Client Secret
- `GOOGLE_CLIENT_ID` in server/.env must **exactly match** `VITE_GOOGLE_CLIENT_ID` in client/.env.local
- Generate a strong JWT_SECRET (at least 32 characters)

---

## Step 3: Verify Setup

### 3.1 Check Client Environment

```powershell
# Check if file exists
Test-Path "client\.env.local"

# View Google Client ID (first 30 chars)
Get-Content "client\.env.local" | Select-String "VITE_GOOGLE_CLIENT_ID"
```

### 3.2 Check Server Environment

```powershell
# Check if file exists
Test-Path "server\.env"

# View Google Client ID (first 30 chars)
Get-Content "server\.env" | Select-String "GOOGLE_CLIENT_ID"
```

### 3.3 Verify Client IDs Match

Both should show the **same** Client ID (not "your-google-client-id").

---

## Step 4: Start Development Servers

### 4.1 Start Both Client and Server

```powershell
# From project root
npm run dev
```

This will start:

- Server on: `http://localhost:5000`
- Client on: `http://localhost:3000`

### 4.2 Or Start Separately

**Terminal 1 - Server:**

```powershell
npm run server
```

**Terminal 2 - Client:**

```powershell
npm run client
```

---

## Step 5: Test the Setup

1. Open browser: `http://localhost:3000`
2. Go to login or signup page
3. Check if Google Sign-In button appears
4. Open DevTools (F12) → Console
5. Look for: `"Google Client ID check:"` log
6. Should show your Client ID (first 20 chars)

---

## Common Issues & Solutions

### Issue 1: "Google Client ID not configured"

**Solution:**

- Check `client/.env.local` exists
- Verify `VITE_GOOGLE_CLIENT_ID` is set (not placeholder)
- Restart dev server: `npm run dev`

### Issue 2: "Wrong recipient, payload audience != requiredAudience"

**Solution:**

- Client IDs don't match
- Verify `VITE_GOOGLE_CLIENT_ID` in `client/.env.local` = `GOOGLE_CLIENT_ID` in `server/.env`
- They must be **exactly the same**

### Issue 3: MongoDB Connection Error

**Solution:**

- Check MongoDB is running
- Verify `MONGODB_URI` in `server/.env` is correct
- For Atlas: Check network access and credentials

### Issue 4: Port Already in Use

**Solution:**

```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill it (replace PID)
taskkill /F /PID <PID>
```

---

## Quick Reference

### Required Variables

**Client (`client/.env.local`):**

- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID

**Server (`server/.env`):**

- `NODE_ENV` - Set to `development`
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret (min 32 chars)
- `GOOGLE_CLIENT_ID` - Must match client's `VITE_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `CORS_ORIGIN` - Frontend URL (http://localhost:3000)
- `FRONTEND_URL` - Frontend URL (http://localhost:3000)

### Optional Variables

These have sensible defaults but can be customized:

- `VITE_PORT` - Client dev server port (default: 3000)
- `VITE_API_TARGET` - Vite proxy target (default: http://localhost:5000)
- `JWT_EXPIRE` - JWT expiration (default: 7d)
- `LOG_LEVEL` - Log level (default: info)

---

## Next Steps

After setting up development environment:

1. ✅ Test the application locally
2. ✅ Verify Google Sign-In works
3. ✅ Test login/signup functionality
4. ✅ Check all routes work correctly

For production setup, see the production guide after development is working.
