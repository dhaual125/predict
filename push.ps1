# PowerShell Auto-Push Script for Predict Repository
param (
    [string]$Message = "update: automated predict platform push"
)

Set-Location $PSScriptRoot
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "[Auto Push] Staging and pushing predict updates..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

git add .
git commit -m "$Message"
git push origin main

Write-Host "==============================================" -ForegroundColor Green
Write-Host "[Auto Push] Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
