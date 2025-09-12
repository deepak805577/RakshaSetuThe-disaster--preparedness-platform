# Disaster Preparedness PWA - Development Launcher
# Run this script in VS Code terminal: .\dev.ps1

Write-Host "🚀 Starting Disaster Preparedness PWA for Punjab Schools" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

# Kill any existing processes on our ports
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for cleanup
Start-Sleep -Seconds 2

# Check MongoDB
Write-Host "🗄️  Checking MongoDB..." -ForegroundColor Cyan
try {
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if (-not $mongoProcess) {
        Write-Host "   Starting MongoDB..." -ForegroundColor Yellow
        Start-Process -WindowStyle Hidden -FilePath "mongod" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    } else {
        Write-Host "   MongoDB is already running ✅" -ForegroundColor Green
    }
} catch {
    Write-Host "   MongoDB not found - please install MongoDB first" -ForegroundColor Red
}

# Start Backend
Write-Host "🖥️  Starting Backend Server..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app\backend"
    npm run dev
}

# Wait for backend to start
Write-Host "   Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if backend is running
$backendRunning = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendRunning = $true
            Write-Host "   Backend started successfully ✅" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $backendRunning) {
    Write-Host "   Backend startup timeout - check backend logs" -ForegroundColor Red
}

# Start Frontend
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app\frontend"
    $env:BROWSER = "none"  # Prevent auto-opening browser
    npm start
}

# Wait for frontend to start
Write-Host "   Waiting for frontend to compile..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if frontend is running
$frontendRunning = $false
for ($i = 1; $i -le 15; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendRunning = $true
            Write-Host "   Frontend compiled successfully ✅" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "🎉 APPLICATION READY!" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host "=" * 60 -ForegroundColor Green

Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   🌐 Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   🖥️  Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   📊 API Health: http://localhost:5000/api/health" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Demo Accounts:" -ForegroundColor Magenta
Write-Host "   👨‍💼 Admin:   admin@demo.com / admin123" -ForegroundColor White
Write-Host "   👩‍🏫 Teacher: teacher@demo.com / teacher123" -ForegroundColor White
Write-Host "   👨‍🎓 Student: student@demo.com / student123" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Opening application in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "⌨️  CONTROLS:" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop both servers" -ForegroundColor White
Write-Host "   Check server logs below for any issues" -ForegroundColor White
Write-Host "=" * 60 -ForegroundColor Green

# Monitor jobs and display logs
Write-Host ""
Write-Host "📋 Server Logs:" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Gray

try {
    while ($true) {
        # Display backend logs
        $backendOutput = Receive-Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue
        }
        
        # Display frontend logs
        $frontendOutput = Receive-Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Green
        }
        
        # Check if jobs are still running
        if ($backendJob.State -eq "Completed" -or $backendJob.State -eq "Failed") {
            Write-Host "Backend process ended" -ForegroundColor Red
        }
        if ($frontendJob.State -eq "Completed" -or $frontendJob.State -eq "Failed") {
            Write-Host "Frontend process ended" -ForegroundColor Red
        }
        
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup jobs when script is terminated
    Write-Host ""
    Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Cleanup complete" -ForegroundColor Green
}
