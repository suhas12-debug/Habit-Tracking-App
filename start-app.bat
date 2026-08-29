@echo off
title HabitGrid Launcher
echo ==========================================
echo       HabitGrid Habit Tracker Launcher
echo ==========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo To run this application, you must install Node.js first.
    echo Opening the official Node.js download page in your browser...
    start "" "https://nodejs.org/"
    pause
    exit /b
)

echo [INFO] Node.js detected.
echo.

:: Check if node_modules folder exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies (this may take a minute on the first run)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies. Please run 'npm install' manually.
        pause
        exit /b
    )
) else (
    echo [INFO] Dependencies already installed.
)

echo.
echo [INFO] Starting the dev server...
:: Open the app in the default browser in 3 seconds (Vite default is http://localhost:5173)
start "" "http://localhost:5173"
call npm run dev

pause
