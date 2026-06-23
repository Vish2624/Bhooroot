@echo off
cd /d "%~dp0backend"
echo Starting Uhazvumart Backend on http://localhost:5000 ...
python -m uvicorn main:app --port 5000
pause
