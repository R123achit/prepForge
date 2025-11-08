# PrepForge Quick Start Script for PowerShell
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PrepForge - Complete MERN Stack Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check MongoDB
Write-Host "[1/4] Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "✓ MongoDB is already running" -ForegroundColor Green
} else {
    Write-Host "Starting MongoDB..." -ForegroundColor Yellow
    try {
        Start-Service -Name MongoDB -ErrorAction Stop
        Write-Host "✓ MongoDB service started" -ForegroundColor Green
    } catch {
        Write-Host "Starting mongod manually..." -ForegroundColor Yellow
        if (!(Test-Path -Path 'C:\data\db')) {
            New-Item -ItemType Directory -Path 'C:\data\db' | Out-Null
        }
        Start-Process -FilePath 'C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe' -ArgumentList "--dbpath C:\data\db --bind_ip 127.0.0.1" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "✓ MongoDB started manually" -ForegroundColor Green
    }
}

Write-Host ""

# Start Backend
Write-Host "[2/4] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath' ; Write-Host 'Backend Server Running...' -ForegroundColor Green ; node src/server.js" -WindowStyle Minimized
Start-Sleep -Seconds 3
Write-Host "✓ Backend started at http://localhost:8000" -ForegroundColor Green

Write-Host ""

# Start Frontend
Write-Host "[3/4] Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath' ; Write-Host 'Frontend Server Running...' -ForegroundColor Green ; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 5
Write-Host "✓ Frontend started at http://localhost:5173" -ForegroundColor Green

Write-Host ""

# Open Browser
Write-Host "[4/4] Opening Application..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
Write-Host "✓ Browser opened" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PrepForge is now running!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Test Users Created:" -ForegroundColor Yellow
Write-Host "  Candidate:   candidate@test.com / password123" -ForegroundColor White
Write-Host "  Interviewer: interviewer@test.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to check service health..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "=== Service Health Check ===" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    Write-Host "✓ Backend Status: $($health.status)" -ForegroundColor Green
    Write-Host "  Environment: $($health.environment)" -ForegroundColor Gray
    Write-Host "  Uptime: $([math]::Round($health.uptime, 2)) seconds" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "Servers are running in minimized windows." -ForegroundColor Green
Write-Host "You can close this window. Servers will continue running." -ForegroundColor Gray
Write-Host ""
