@echo off
title Wrist Wonders - Node.js and MongoDB Server
echo ========================================================
echo   Starting Wrist Wonders Backend (Node.js + MongoDB)
echo ========================================================
echo.

REM 1. Check if MongoDB is running on port 27017
netstat -ano | findstr 27017 >nul
if %errorlevel% neq 0 (
    echo [1/3] Starting MongoDB local instance...
    if not exist "%~dp0data\db" mkdir "%~dp0data\db"
    start "MongoDB Server" "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "%~dp0data\db" --bind_ip 127.0.0.1 --port 27017
    timeout /t 3 /nobreak >nul
) else (
    echo [1/3] MongoDB is already running on port 27017.
)

REM 2. Check if dependencies are installed
if not exist "%~dp0node_modules" (
    echo [2/3] Installing dependencies...
    call npm install
) else (
    echo [2/3] Dependencies found.
)

REM 3. Open browser and start Node.js server
echo [3/3] Launching Node.js Server on http://localhost:3000...
start http://localhost:3000
npm start
pause
