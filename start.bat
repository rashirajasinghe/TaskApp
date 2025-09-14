@echo off
echo Starting Task Manager Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Opening frontend-only version instead...
    start index.html
    exit /b 1
)

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies.
        echo Please run 'npm install' manually.
        pause
        exit /b 1
    )
)

echo Starting server...
echo.
echo Task Manager will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm start
