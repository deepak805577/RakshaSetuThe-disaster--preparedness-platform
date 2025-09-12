# Disaster Preparedness PWA - Simple Launcher
Write-Host "Starting Disaster Preparedness PWA for Punjab Schools..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

# Clean up any existing processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start MongoDB if available
Write-Host "Starting MongoDB..." -ForegroundColor Cyan
Start-Process -WindowStyle Hidden -FilePath "mongod" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Starting both servers..." -ForegroundColor Cyan
Write-Host ""

# Use npm run dev from root directory (uses concurrently)
npm run dev

Write-Host ""
Write-Host "Servers stopped." -ForegroundColor Yellow
