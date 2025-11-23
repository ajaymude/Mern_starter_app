# Fix GitHub Push Protection - Remove Secrets

GitHub is blocking your push because Google OAuth credentials are in commit `6840ef1`.

## Quick Solution

### Step 1: Remove File from Git History

Run these commands in PowerShell:

```powershell
# Navigate to project root (if not already)
cd C:\Users\ajay\Documents\starterProject

# Set environment variable
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"

# Remove the file from all commits
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch STEP_BY_STEP_SETUP.md" --prune-empty -- --all

# Clean up backup refs
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object { git update-ref -d $_ }

# Force garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 2: Force Push to GitHub

```powershell
git push --force origin main
```

## Alternative: Simpler Method (If above doesn't work)

### Option A: Use GitHub's Allow Secret Feature

1. Visit the URL GitHub provided:
   ```
   https://github.com/ajaymude/Mern_starter_app/security/secret-scanning/unblock-secret/35squEVJRHOoeVKcb425o9lZm3C
   ```

2. Click "Allow secret" (only if you've rotated the credentials)

### Option B: Create New Repository

If the above is too complex:

1. **Create a new repository** on GitHub
2. **Remove secrets from all files** (use placeholders)
3. **Push fresh:**
   ```powershell
   git remote set-url origin <new-repo-url>
   git push -u origin main
   ```

## Important: Rotate Your Credentials

⚠️ **CRITICAL:** Since your credentials are in git history, you MUST:

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials

2. **Revoke/Delete the old credentials:**
   - Client ID: `202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7`
   - Client Secret: `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`

3. **Create new credentials**

4. **Update your `.env` files** with the new credentials

## Prevent Future Issues

1. **Never commit real secrets** - Always use placeholders:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

2. **Add to .gitignore:**
   ```
   # Documentation files that might contain examples
   *SETUP*.md
   *setup*.md
   !SETUP.md
   ```

3. **Use .env.example files** with placeholders only

4. **Review before committing:**
   ```powershell
   git diff --cached | Select-String -Pattern "202761390203|GOCSPX"
   ```

## Quick Commands Summary

```powershell
# 1. Remove from history
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch STEP_BY_STEP_SETUP.md" --prune-empty -- --all

# 2. Clean up
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object { git update-ref -d $_ }
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Force push
git push --force origin main
```

## After Fixing

1. ✅ Rotate Google OAuth credentials
2. ✅ Update `.env` files with new credentials
3. ✅ Test the application
4. ✅ Never commit secrets again

