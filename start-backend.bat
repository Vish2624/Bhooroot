@echo off
cd /d "%~dp0backend"
echo Starting Uhazvumart backend...
echo.
uvicorn main:app --port 5000
pause
