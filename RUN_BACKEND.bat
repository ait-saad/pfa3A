@echo off
echo ========================================
echo Smart Sleep Tracker - Backend Server
echo ========================================
echo.

cd backend

echo Checking dependencies...
python -m pip install --quiet fastapi uvicorn pydantic numpy

echo.
echo Starting backend server...
echo API will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py

pause
