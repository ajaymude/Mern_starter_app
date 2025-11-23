# Fix GitHub Push Protection - Remove Secrets from Git History

GitHub detected Google OAuth credentials in your git history and is blocking the push.

## Quick Fix (Recommended)

### Option 1: Use BFG Repo-Cleaner (Easiest)

1. **Download BFG Repo-Cleaner:**
   - Download from: https://rtyley.github.io/bfg-repo-cleaner/
   - Or use: `winget install BFG-Repo-Cleaner` (if available)

2. **Create a file with secrets to remove:**
   ```powershell
   # Create secrets.txt
   @"
   202761390203-6pc1ievc2rv408tgouqkmmr4et083jt7.apps.googleusercontent.com
   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
   "@ | Out-File -Encoding utf8 secrets.txt
   ```

3. **Run BFG:**
   ```powershell
   java -jar bfg.jar --replace-text secrets.txt
   ```

4. **Force push:**
   ```powershell
   git push --force origin main
   ```

### Option 2: Manual Git Filter-Branch

```powershell
# Set environment variable to suppress warning
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"

# Remove the file from all commits
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch STEP_BY_STEP_SETUP.md" `
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push --force origin main
```

### Option 3: Interactive Rebase (If only 1-2 commits)

```powershell
# Start interactive rebase from before the problematic commit
git rebase -i HEAD~3

# In the editor, change "pick" to "edit" for commit 6840ef1
# Then:
git rm STEP_BY_STEP_SETUP.md
git commit --amend --no-edit
git rebase --continue

# Force push
git push --force origin main
```

### Option 4: Create New Branch (Simplest but loses history)

```powershell
# Create a new branch without the problematic commit
git checkout -b main-clean $(git hash-object -t tree /dev/null)

# Add all files except the one with secrets
git add .
git commit -m "Clean history without secrets"

# Force push
git push --force origin main-clean:main
```

## Important Notes

⚠️ **Warning:** All these methods rewrite git history. If others have cloned your repo, they'll need to re-clone.

✅ **After fixing:** Make sure to:
1. Rotate your Google OAuth credentials (they're now in git history)
2. Never commit secrets again
3. Use `.env.example` files with placeholders only

## Prevent Future Issues

1. **Add to .gitignore:**
   ```
   *.md
   !README.md
   !SETUP.md
   ```

2. **Use placeholders in documentation:**
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Use git-secrets or similar tools** to prevent committing secrets

## Rotate Your Credentials

Since your credentials are in git history, you should:

1. Go to Google Cloud Console
2. Revoke the old Client ID/Secret
3. Create new credentials
4. Update your `.env` files with new credentials

