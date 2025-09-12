@echo off
echo 🚀 Starting Disaster Preparedness PWA for Punjab Schools
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
if not exist "node_modules" (
    npm install
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
if not exist "node_modules" (
    npm install
)

REM Check for environment files
echo 🔧 Checking environment configuration...

if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found. Creating from example...
    copy backend\env.example backend\.env
    echo 📝 Please update backend\.env with your configuration.
)

if not exist "frontend\.env" (
    echo ⚠️  Frontend .env file not found. Creating from example...
    copy frontend\env.example frontend\.env
)

REM Start backend server
echo 🖥️  Starting backend server...
cd ..\backend
start "Backend Server" cmd /k "npm run dev"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend server
echo 🌐 Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Application started successfully!
echo ==================================================
echo 🌐 Frontend: http://localhost:3000
echo 🖥️  Backend API: http://localhost:5000
echo 📊 API Health: http://localhost:5000/api/health
echo.
echo 📱 Demo Accounts:
echo    Admin: admin@demo.com / admin123
echo    Teacher: teacher@demo.com / teacher123
echo    Student: student@demo.com / student123
echo.
echo 🛑 To stop the application, close the command windows
echo ==================================================
pause
