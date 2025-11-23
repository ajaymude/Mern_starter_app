# Step-by-Step Environment Setup for Development

Let's set up your environment variables step by step for **development mode**.

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ Node.js installed
- ✅ MongoDB running (local or Atlas connection string)
- ✅ Google OAuth credentials (Client ID and Secret)

---

## Step 1: Client Environment Setup

### 1.1 Check Current Status

Your `client/.env.local` already exists and has:

```
VITE_GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
```

✅ **Client is already set up!**

### 1.2 Verify Client Setup

If you need to update it, edit `client/.env.local`:

```env
# Google OAuth Client ID (REQUIRED)
VITE_GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com

# API Configuration (for development, leave as default)
VITE_API_BASE_URL=/api/auth
VITE_PORT=3000
VITE_API_TARGET=http://localhost:5000
```

---

## Step 2: Server Environment Setup

### 2.1 Create Server .env File

Run this command:

```powershell
Copy-Item "server\env.example" "server\.env"
```

Or manually create `server/.env` file.

### 2.2 Edit server/.env

Open `server/.env` and set these **required** values:

```env
# ============================================
# BASIC CONFIGURATION
# ============================================
NODE_ENV=development
PORT=5000

# ============================================
# DATABASE
# ============================================
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/mern-starter

# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-starter

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# ============================================
# CORS & FRONTEND
# ============================================
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# ============================================
# GOOGLE OAUTH (REQUIRED)
# ============================================
# MUST match VITE_GOOGLE_CLIENT_ID in client/.env.local
GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
```

### 2.3 Important Values to Set

**Replace these with your actual values:**

1. **MONGODB_URI**

   - Local: `mongodb://localhost:27017/mern-starter`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/mern-starter`

2. **JWT_SECRET**

   - Must be at least 32 characters
   - Generate: `openssl rand -base64 32`
   - Example: `my-super-secret-jwt-key-for-development-min-32-chars`

3. **GOOGLE_CLIENT_ID**

   - Must **exactly match** `VITE_GOOGLE_CLIENT_ID` in `client/.env.local`
   - Your value: `202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com`

4. **GOOGLE_CLIENT_SECRET**
   - Get from Google Cloud Console
   - Your value: `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`

---

## Step 3: Verify Setup

### 3.1 Check Client Environment

```powershell
Get-Content "client\.env.local" | Select-String "VITE_GOOGLE_CLIENT_ID"
```

Should show:

```
VITE_GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
```

### 3.2 Check Server Environment

```powershell
Get-Content "server\.env" | Select-String "GOOGLE_CLIENT_ID"
```

Should show:

```
GOOGLE_CLIENT_ID=202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
```

### 3.3 Verify They Match

Both Client IDs must be **exactly the same**!

---

## Step 4: Quick Setup Script (Automated)

For automated setup, run:

```powershell
.\setup-env-dev.ps1
```

This script will:

- ✅ Check/create `client/.env.local`
- ✅ Check/create `server/.env`
- ✅ Ask for MongoDB URI
- ✅ Ask for JWT Secret
- ✅ Ask for Google credentials
- ✅ Verify Client IDs match
- ✅ Set all development values

---

## Step 5: Start Development Servers

### 5.1 Start Both Together

```powershell
npm run dev
```

This starts:

- Server: `http://localhost:5000`
- Client: `http://localhost:3000`

### 5.2 Or Start Separately

**Terminal 1 - Server:**

```powershell
npm run server
```

**Terminal 2 - Client:**

```powershell
npm run client
```

---

## Step 6: Test the Setup

1. **Open browser:** `http://localhost:3000`
2. **Go to login/signup page**
3. **Check Google button appears**
4. **Open DevTools (F12) → Console**
5. **Look for:** `"Google Client ID check:"` log
6. **Should show:** Your Client ID (first 20 chars)

---

## ✅ Checklist

Before starting development, verify:

- [ ] `client/.env.local` exists with `VITE_GOOGLE_CLIENT_ID`
- [ ] `server/.env` exists with all required values
- [ ] `GOOGLE_CLIENT_ID` in server matches `VITE_GOOGLE_CLIENT_ID` in client
- [ ] `MONGODB_URI` is set correctly
- [ ] `JWT_SECRET` is set (min 32 chars)
- [ ] `NODE_ENV=development` in server/.env
- [ ] MongoDB is running
- [ ] Both servers start without errors

---

## 🐛 Troubleshooting

### Issue: "Google Client ID not configured"

**Fix:**

- Check `client/.env.local` has `VITE_GOOGLE_CLIENT_ID`
- Restart dev server: `npm run dev`

### Issue: "Wrong recipient, payload audience != requiredAudience"

**Fix:**

- Client IDs don't match
- Verify both files have the **exact same** Client ID

### Issue: MongoDB Connection Error

**Fix:**

- Check MongoDB is running
- Verify `MONGODB_URI` is correct
- For Atlas: Check network access

### Issue: Port Already in Use

**Fix:**

```powershell
# Find process
netstat -ano | findstr :5000

# Kill it
taskkill /F /PID <PID>
```

---

## 📝 Summary

**Client (`client/.env.local`):**

- ✅ Already set up with Google Client ID

**Server (`server/.env`):**

- Need to create and set:
  - `NODE_ENV=development`
  - `MONGODB_URI` (your MongoDB connection)
  - `JWT_SECRET` (min 32 chars)
  - `GOOGLE_CLIENT_ID` (must match client)
  - `GOOGLE_CLIENT_SECRET` (from Google Console)
  - `CORS_ORIGIN=http://localhost:3000`
  - `FRONTEND_URL=http://localhost:3000`

**Next:** Run `.\setup-env-dev.ps1` for automated setup, or manually edit `server/.env` following the guide above.
