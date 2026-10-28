# ==============================================================================
# SEMI NEX AI — Deploy to a New GitHub Account & GitHub Pages
# ==============================================================================

param(
    [string]$NewRepoUrl = ""
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  SEMI NEX AI — GitHub Pages Deployment to New Account   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Prompt for new repository URL if not provided
if (-not $NewRepoUrl) {
    Write-Host "Enter your new GitHub repository URL or repo name." -ForegroundColor Yellow
    Write-Host "Examples:" -ForegroundColor Gray
    Write-Host "  - https://github.com/YourNewAccount/seminex-ai.git" -ForegroundColor Gray
    Write-Host "  - YourNewAccount/seminex-ai" -ForegroundColor Gray
    Write-Host ""
    $NewRepoUrl = Read-Host "Enter New Repo URL"
}

if (-not $NewRepoUrl) {
    Write-Host "Error: No repository URL provided. Aborting." -ForegroundColor Red
    exit 1
}

# Normalize to full https git URL
if (-not $NewRepoUrl.StartsWith("http") -and -not $NewRepoUrl.StartsWith("git@")) {
    $NewRepoUrl = "https://github.com/$NewRepoUrl.git"
}
if (-not $NewRepoUrl.EndsWith(".git")) {
    $NewRepoUrl = "$NewRepoUrl.git"
}

Write-Host ""
Write-Host "[1/5] Staging all files including GitHub Pages configuration..." -ForegroundColor Green
git add .

Write-Host "[2/5] Creating commit for GitHub Pages standalone build..." -ForegroundColor Green
git commit -m "Configure SEMI NEX AI for GitHub Pages static hosting with client fallback engine"

Write-Host "[3/5] Re-pointing git origin remote to new repository: $NewRepoUrl" -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin $NewRepoUrl
git branch -M main

Write-Host "[4/5] Pushing to $NewRepoUrl (main branch)..." -ForegroundColor Green
Write-Host "If prompted, authenticate with your NEW GitHub account credentials or Personal Access Token (PAT)." -ForegroundColor Yellow
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Code pushed to new repository.                " -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    
    # Extract username and repo name for Pages URL
    if ($NewRepoUrl -match "github\.com[/:]([^/]+)/([^/\.]+)") {
        $User = $matches[1]
        $Repo = $matches[2]
        $PagesUrl = "https://$User.github.io/$Repo/"
        
        Write-Host "FINAL STEP TO ACTIVATE GITHUB PAGES:" -ForegroundColor Yellow
        Write-Host "1. Open your new repo in browser: https://github.com/$User/$Repo" -ForegroundColor White
        Write-Host "2. Go to: Settings -> Pages" -ForegroundColor White
        Write-Host "3. Under 'Build and deployment' -> 'Source', select:" -ForegroundColor White
        Write-Host "   ==> 'GitHub Actions'" -ForegroundColor Cyan
        Write-Host "4. The included workflow (.github/workflows/deploy.yml) will automatically build and publish!" -ForegroundColor White
        Write-Host ""
        Write-Host "Your website will be live at:" -ForegroundColor Green
        Write-Host "  ==> $PagesUrl" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "Push failed. If this is a new GitHub account, ensure:" -ForegroundColor Red
    Write-Host "1. You created the empty repository on your new GitHub account." -ForegroundColor White
    Write-Host "2. You are logged into the new account in your browser or Git credentials." -ForegroundColor White
    Write-Host "   (Run: 'gh auth login' or enter a GitHub Personal Access Token when prompted)" -ForegroundColor White
}
