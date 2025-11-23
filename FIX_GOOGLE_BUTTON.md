# Fix Google Button Not Showing

## Quick Fix Steps

### Step 1: Restart Dev Server

The Google script needs to load properly. Restart your dev server:

```powershell
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Hard Refresh Browser

Clear browser cache and reload:

- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### Step 3: Check Browser Console

Open DevTools (F12) → Console tab and look for:

1. **"Google Client ID check:"** - Should show your Client ID
2. **"Google script tag found in HTML, waiting for load..."** - Script detected
3. **"Google script loaded, initializing button..."** - Script loaded
4. **"Google button rendered successfully"** - Button should appear

### Step 4: Check Network Tab

Open DevTools (F12) → Network tab:

1. Filter by "gsi" or "google"
2. Look for: `accounts.google.com/gsi/client`
3. Should show status **200** (success)
4. If it shows error, check internet connection

### Step 5: Verify Environment Variable

```powershell
Get-Content "client\.env.local" | Select-String "VITE_GOOGLE_CLIENT_ID"
```

Should show your actual Client ID (not placeholder).

## Common Issues

### Issue 1: Script Not Loading (Network Error)

**Symptoms:**

- Error: "Failed to load Google Sign-In script"
- Network tab shows failed request

**Solutions:**

1. Check internet connection
2. Check firewall/antivirus blocking Google's CDN
3. Try accessing: https://accounts.google.com/gsi/client in browser
4. Check if you're behind a corporate proxy

### Issue 2: Script Loads But Button Doesn't Appear

**Symptoms:**

- Console shows "Google script loaded"
- But button doesn't render

**Solutions:**

1. Check Client ID is correct (not placeholder)
2. Verify Client ID matches server/.env
3. Check browser console for initialization errors
4. Try clearing browser cache completely

### Issue 3: "Client ID not configured"

**Symptoms:**

- Error shows placeholder Client ID

**Solutions:**

1. Edit `client/.env.local`
2. Set `VITE_GOOGLE_CLIENT_ID` to your actual Client ID
3. Restart dev server: `npm run dev`

## Debugging Steps

1. **Check script in HTML:**

   - View page source (Ctrl+U)
   - Look for: `<script src="https://accounts.google.com/gsi/client" async defer></script>`
   - Should be in `<head>` section

2. **Check window.google:**

   - Open browser console
   - Type: `window.google`
   - Should show an object (not undefined)

3. **Check Client ID:**

   - Console: `import.meta.env.VITE_GOOGLE_CLIENT_ID`
   - Should show your actual Client ID

4. **Check button element:**
   - Inspect the page
   - Look for `<div ref={buttonRef}>` element
   - Should exist in the DOM

## What I Fixed

1. ✅ Increased retry attempts from 30 to 50
2. ✅ Improved script loading detection
3. ✅ Added better error logging
4. ✅ Added network status check
5. ✅ Improved timing with initialization delay

## Still Not Working?

1. **Check if script loads:**

   ```javascript
   // In browser console
   document.querySelector('script[src*="accounts.google.com/gsi/client"]');
   ```

2. **Check if Google API is available:**

   ```javascript
   // In browser console
   window.google;
   ```

3. **Try manual initialization:**

   ```javascript
   // In browser console (replace with your Client ID)
   window.google.accounts.id.initialize({
     client_id: "your-client-id",
     callback: console.log,
   });
   ```

4. **Check for CORS errors:**
   - Look in Console for CORS-related errors
   - Check Network tab for failed requests

## Next Steps

After fixing:

1. Restart dev server
2. Hard refresh browser
3. Check console logs
4. Verify button appears

If still not working, check:

- Internet connection
- Firewall settings
- Browser extensions blocking scripts
- Corporate network restrictions
