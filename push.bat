@echo off
cd /d "%~dp0"
echo ==============================================
echo [Auto Push] Staging and pushing predict updates...
echo ==============================================
git add .
set msg=%*
if "%msg%"=="" set msg=update: auto push predict updates %date% %time%
git commit -m "%msg%"
git push origin main
echo ==============================================
echo [Auto Push] Successfully pushed to GitHub!
echo ==============================================
