# Remove secrets from git history
# This script removes STEP_BY_STEP_SETUP.md from git history

Write-Host "Removing secrets from git history..." -ForegroundColor Yellow
Write-Host ""

# Set environment variable to suppress warning
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"

# Get the commit hash that contains the file
$commitHash = "6840ef1abb1b2cb6293a9f63e327386e56f11f60"

Write-Host "Removing file from commit: $commitHash" -ForegroundColor Cyan

# Method 1: Remove file from specific commit using filter-branch
Write-Host ""
Write-Host "Attempting to remove file from history..." -ForegroundColor Yellow

# Use git filter-branch to remove the file
git filter-branch --force --index-filter `
  "if git ls-files --error-unmatch STEP_BY_STEP_SETUP.md >$null 2>&1; then git rm --cached --ignore-unmatch STEP_BY_STEP_SETUP.md; fi" `
  --prune-empty --tag-name-filter cat -- --all 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ File removed from git history" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Force push to GitHub" -ForegroundColor Yellow
    Write-Host "Run: git push --force origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠ WARNING: This rewrites history. If others have cloned, they need to re-clone." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Error occurred. Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Use git rebase to remove the file
    Write-Host ""
    Write-Host "Alternative: You can manually edit the commit:" -ForegroundColor Yellow
    Write-Host "1. git rebase -i $($commitHash)^" -ForegroundColor Cyan
    Write-Host "2. Change 'pick' to 'edit' for the commit" -ForegroundColor Cyan
    Write-Host "3. git rm STEP_BY_STEP_SETUP.md" -ForegroundColor Cyan
    Write-Host "4. git commit --amend --no-edit" -ForegroundColor Cyan
    Write-Host "5. git rebase --continue" -ForegroundColor Cyan
    Write-Host "6. git push --force origin main" -ForegroundColor Cyan
}

