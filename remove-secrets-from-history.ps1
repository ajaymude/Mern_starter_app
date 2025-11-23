# Script to remove secrets from git history
# This will rewrite git history to remove Google OAuth credentials

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Removing Secrets from Git History" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will rewrite git history!" -ForegroundColor Yellow
Write-Host "If you've already pushed, you'll need to force push." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Removing secrets from git history..." -ForegroundColor Yellow

# Remove the file from all commits
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch STEP_BY_STEP_SETUP.md" `
  --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Secrets removed from git history" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Force push to update remote:" -ForegroundColor White
    Write-Host "   git push --force origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. If you have other branches, update them too:" -ForegroundColor White
    Write-Host "   git push --force --all origin" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error removing secrets. Try manual method." -ForegroundColor Red
}

