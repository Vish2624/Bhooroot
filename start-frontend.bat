@echo off
cd /d "%~dp0frontend"
echo Starting Uhazvumart Frontend on http://localhost:3000 ...
python -m http.server 3000
pause
