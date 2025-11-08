@echo off
echo ============================================
echo PrepForge - Complete MERN Stack Setup
echo ============================================
echo.

echo [1/4] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo MongoDB is not running. Starting MongoDB...
    net start MongoDB 2>nul
    if %errorlevel% neq 0 (
        echo MongoDB service failed. Starting mongod manually...
        if not exist "C:\data\db" mkdir "C:\data\db"
        start /min "MongoDB" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath C:\data\db --bind_ip 127.0.0.1
        timeout /t 3 >nul
    )
) else (
    echo MongoDB is already running.
)

echo.
echo [2/4] Starting Backend Server...
cd /d "%~dp0backend"
start /min "PrepForge Backend" cmd /k "node src/server.js"
timeout /t 3 >nul

echo.
echo [3/4] Starting Frontend Server...
cd /d "%~dp0frontend"
start /min "PrepForge Frontend" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo [4/4] Opening Application...
timeout /t 5 >nul
start http://localhost:5173

echo.
echo ============================================
echo PrepForge is now running!
echo ============================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to view service status...
pause >nul

echo.
echo === Service Status ===
curl -s http://localhost:8000/health
echo.
echo.
echo Press any key to exit (servers will continue running)...
pause >nul
