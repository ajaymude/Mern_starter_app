# URGENT: Fix Google Origin Error

## Current Error

```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

## Your Client ID

```
202761390203-jcspf9nen4c2tfj9bsum7q8a4ha2p3ji.apps.googleusercontent.com
```

## The Problem

`http://localhost:5000` is **NOT** in the Authorized JavaScript origins for this Client ID in Google Cloud Console.

## Step-by-Step Fix (DO THIS NOW)

### Step 1: Open Google Cloud Console

**Direct Link:** https://console.cloud.google.com/apis/credentials?project=practicemaster-18

Or manually:

1. Go to: https://console.cloud.google.com
2. Select project: **practicemaster-18**
3. Go to: **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth Client

1. Look for: **OAuth 2.0 Client IDs** section
2. Find the client with ID: `202761390203-jcspf9nen4c2tfj9bsum7q8a4ha2p3ji`
3. Click the **✏️ Edit** icon (pencil) on the right

### Step 3: Add Authorized JavaScript Origins

1. Scroll to **"Authorized JavaScript origins"**
2. Check if `http://localhost:5000` is in the list
3. If **NOT present**:
   - Click **"+ ADD URI"**
   - Type exactly: `http://localhost:5000`
   - Press Enter
4. Also add (for development):
   - Click **"+ ADD URI"** again
   - Type: `http://localhost:3000`
   - Press Enter

### Step 4: Verify Authorized Redirect URIs

1. Scroll to **"Authorized redirect URIs"**
2. Ensure this is present:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
3. If **NOT present**:
   - Click **"+ ADD URI"**
   - Type exactly: `http://localhost:5000/api/auth/google/callback`
   - Press Enter

### Step 5: SAVE

1. Scroll to the **bottom** of the page
2. Click the blue **"SAVE"** button
3. Wait for confirmation: "Client saved successfully"

### Step 6: Wait and Test

1. **Wait 2-3 minutes** (Google needs time to propagate changes)
2. **Hard refresh** browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. **Clear browser cache** if needed
4. Try the Google button again

## What Should Be Configured

### Authorized JavaScript origins:

```
http://localhost:5000
http://localhost:3000
```

### Authorized redirect URIs:

```
http://localhost:5000/api/auth/google/callback
```

## Verification Checklist

After saving, verify:

- [ ] `http://localhost:5000` is in Authorized JavaScript origins
- [ ] `http://localhost:3000` is in Authorized JavaScript origins (optional but recommended)
- [ ] `http://localhost:5000/api/auth/google/callback` is in Authorized redirect URIs
- [ ] Changes are SAVED (you see confirmation message)
- [ ] Waited 2-3 minutes after saving
- [ ] Did hard refresh (Ctrl+Shift+R)
- [ ] Error is gone from browser console

## Still Not Working?

1. **Double-check the Client ID** in Google Console matches:
   `202761390203-jcspf9nen4c2tfj9bsum7q8a4ha2p3ji.apps.googleusercontent.com`

2. **Check for typos** in the origin:

   - ✅ Correct: `http://localhost:5000`
   - ❌ Wrong: `https://localhost:5000` (no https)
   - ❌ Wrong: `http://localhost:5000/` (no trailing slash)
   - ❌ Wrong: `localhost:5000` (missing http://)

3. **Try incognito/private mode** to rule out cache issues

4. **Check browser console** for the exact error message
