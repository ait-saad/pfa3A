@echo off
echo ========================================
echo Smart Sleep Tracker - API Test Suite
echo ========================================
echo.

cd backend

echo Installing test dependencies...
python -m pip install --quiet requests numpy

echo.
echo Running tests...
echo.

python test_api.py

echo.
pause
