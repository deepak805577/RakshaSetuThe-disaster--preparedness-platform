@echo off
echo Starting Disaster Preparedness App...
echo.

echo Starting backend server (port 5000)...
start "Backend Server" node local-server.js
timeout /t 3 /nobreak > nul

echo Starting frontend (port 3000)...
cd frontend
start "Frontend" npm start

echo.
echo ✅ Both servers are starting!
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:5000
echo.
echo Press any key to continue...
pause > nul
