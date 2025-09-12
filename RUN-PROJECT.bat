@echo off
title Disaster Preparedness PWA - Punjab Schools
color 0A

echo.
echo ========================================
echo   DISASTER PREPAREDNESS PWA
echo   Punjab Schools Education Platform
echo ========================================
echo.

echo [1] Starting MongoDB...
start /B mongod >nul 2>&1

echo [2] Installing dependencies (if needed)...
if not exist "node_modules" npm install >nul

echo [3] Starting both servers...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press Ctrl+C to stop servers
echo ========================================

npm run dev

echo.
echo Servers stopped. Press any key to exit.
pause >nul
