# How to Update Google Redirect URI - Step by Step

## Step 1: Open Google Cloud Console
1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Make sure you're signed in with the correct Google account
3. Select the correct project: **practicemaster-18**

## Step 2: Find Your OAuth Client
1. Look for the OAuth 2.0 Client ID section
2. Find the client with ID: `202761390203-8o8qjjre013ul6ri6rtl824noimr1csm`
3. You'll see it listed as "Web client" or similar
4. Click the **pencil/edit icon (✏️)** on the right side of that row

## Step 3: Update Authorized Redirect URIs
1. Scroll down to the **"Authorized redirect URIs"** section
2. You'll see a list of URIs (currently shows `http://localhost:5000`)
3. **Remove** the incorrect one:
   - Click the **trash/delete icon (🗑️)** next to `http://localhost:5000`
4. **Add** the correct one:
   - Click **"+ ADD URI"** button
   - Type exactly: `http://localhost:5000/api/auth/google/callback`
   - Press Enter or click outside the field

## Step 4: Verify Authorized JavaScript Origins
While you're there, make sure these are set:
1. Scroll to **"Authorized JavaScript origins"** section
2. You should see:
   - `http://localhost:5000` ✓
   - `http://localhost:3000` ✓ (for development)
3. If missing, click **"+ ADD URI"** and add them

## Step 5: Save Changes
1. Scroll to the **bottom** of the page
2. Click the blue **"SAVE"** button
3. Wait for the confirmation message: "Client saved successfully"

## Step 6: Wait and Test
1. **Wait 1-2 minutes** for changes to propagate
2. **Restart your server** (if it's running):
   ```powershell
   # Stop server (Ctrl+C)
   npm run dev
   # OR
   npm run start:prod
   ```
3. **Hard refresh** your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Try clicking the Google Sign-In button again

## Visual Guide

```
Google Cloud Console → APIs & Services → Credentials
  ↓
Find: OAuth 2.0 Client IDs
  ↓
Click: ✏️ Edit (on your client)
  ↓
Scroll to: Authorized redirect URIs
  ↓
Remove: http://localhost:5000
  ↓
Add: http://localhost:5000/api/auth/google/callback
  ↓
Scroll to: Authorized JavaScript origins
  ↓
Verify: http://localhost:5000 and http://localhost:3000 are present
  ↓
Click: SAVE (bottom of page)
```

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

## Troubleshooting

**Can't find the credentials page?**
- Make sure you're in the correct project: **practicemaster-18**
- URL should be: `https://console.cloud.google.com/apis/credentials?project=practicemaster-18`

**Don't see the edit button?**
- Make sure you have Editor or Owner permissions for the project
- Try refreshing the page

**Changes not working after saving?**
- Wait 2-3 minutes (Google needs time to propagate changes)
- Clear browser cache
- Try incognito/private browsing mode

