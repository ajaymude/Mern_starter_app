# Google OAuth Setup Guide

## Current Configuration

- **Client ID**: `202761390203-84gijcu4ghjnsuutf3t2cnt4pkhpqss7.apps.googleusercontent.com`
- **Server URL**: `http://localhost:5000`
- **Development URL**: `http://localhost:3000`

## Required Google Cloud Console Configuration

### 1. Authorized JavaScript Origins

Add these origins in Google Cloud Console:

```
http://localhost:5000
http://localhost:3000
```

**Steps:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. Under **Authorized JavaScript origins**, click **+ ADD URI**
5. Add: `http://localhost:5000`
6. Add: `http://localhost:3000`
7. Click **SAVE**

### 2. Authorized Redirect URIs

Ensure this redirect URI is configured:

```
http://localhost:5000/api/auth/google/callback
```

**Steps:**
1. In the same OAuth client configuration
2. Under **Authorized redirect URIs**, click **+ ADD URI**
3. Add: `http://localhost:5000/api/auth/google/callback`
4. Click **SAVE**

## After Configuration

1. **Wait 1-2 minutes** for changes to propagate
2. **Hard refresh** your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. The Google Sign-In button should now appear and work

## Troubleshooting

### Error: "The given origin is not allowed for the given client ID"

- **Cause**: The current origin is not in the authorized list
- **Fix**: Add the origin to **Authorized JavaScript origins** in Google Cloud Console
- **Note**: Changes can take 1-2 minutes to propagate

### Error: "Failed to load resource: 400"

- **Cause**: Usually related to origin not being authorized
- **Fix**: Same as above - ensure origin is in authorized list

### Button not showing

1. Check browser console for errors
2. Verify Client ID matches in both `server/.env` and `client/.env.local`
3. Ensure CSP allows Google scripts (already configured)
4. Verify origins are added in Google Cloud Console

## Production Setup

For production, you'll need to:

1. Add your production domain to **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   ```

2. Add your production callback to **Authorized redirect URIs**:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

3. Update environment variables:
   - `server/.env`: `FRONTEND_URL` and `CORS_ORIGIN`
   - `client/.env.local`: Rebuild with production values

