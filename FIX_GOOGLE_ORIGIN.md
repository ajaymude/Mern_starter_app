# Fix: Google Origin Not Allowed Error

## Current Error
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

## Why This Happens
Google requires you to explicitly authorize which origins (URLs) can use your OAuth Client ID. Currently, `http://localhost:5000` is not authorized.

## Step-by-Step Fix

### 1. Open Google Cloud Console
Go to: **https://console.cloud.google.com/apis/credentials**

### 2. Find Your OAuth Client
- Look for Client ID: `202761390203-84gijcu4ghjnsuutf3t2cnt4pkhpqss7`
- Click the **pencil/edit icon** (✏️) next to it

### 3. Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section:
1. Click **+ ADD URI**
2. Type: `http://localhost:5000`
3. Click **+ ADD URI** again
4. Type: `http://localhost:3000`
5. Click **SAVE** (at the bottom of the page)

### 4. Verify Authorized Redirect URIs
In the **Authorized redirect URIs** section, ensure you have:
- `http://localhost:5000/api/auth/google/callback`

If not present:
1. Click **+ ADD URI**
2. Type: `http://localhost:5000/api/auth/google/callback`
3. Click **SAVE**

### 5. Wait and Refresh
- **Wait 1-2 minutes** for changes to propagate
- **Hard refresh** your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Try clicking the Google button again

## Verification Checklist

After making changes, verify:

- [ ] `http://localhost:5000` is in **Authorized JavaScript origins**
- [ ] `http://localhost:3000` is in **Authorized JavaScript origins**
- [ ] `http://localhost:5000/api/auth/google/callback` is in **Authorized redirect URIs**
- [ ] Changes are **SAVED** (check for confirmation message)
- [ ] Waited 1-2 minutes after saving
- [ ] Did a hard refresh (Ctrl+Shift+R)
- [ ] Checked browser console - origin error should be gone

## Still Not Working?

1. **Check the exact origin in console**: Look at the error message - it should tell you which origin is being blocked
2. **Verify Client ID matches**: Ensure the Client ID in Google Console matches:
   - `server/.env`: `GOOGLE_CLIENT_ID`
   - `client/.env.local`: `VITE_GOOGLE_CLIENT_ID`
3. **Clear browser cache**: Sometimes cached CSP headers can cause issues
4. **Check for typos**: Make sure there are no extra spaces or `https://` instead of `http://`

## Common Mistakes

❌ **Wrong**: `https://localhost:5000` (should be `http://`)  
❌ **Wrong**: `localhost:5000` (missing `http://`)  
❌ **Wrong**: `http://localhost:5000/` (trailing slash)  
✅ **Correct**: `http://localhost:5000`

