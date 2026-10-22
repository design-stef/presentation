@echo off
cd /d "%~dp0"
echo Lancement de la presentation...
where node >nul 2>nul
if %errorlevel%==0 (
  node serve.mjs
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
)
pause
