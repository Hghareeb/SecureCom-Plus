@echo off
REM SecureCom+ Quick Start Script for Windows

echo Starting SecureCom+ Encryption Toolkit...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python 3 is not installed. Please install Python 3.10+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo Prerequisites check passed
echo.

REM Backend setup
echo Setting up backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing backend dependencies...
pip install -q -r requirements.txt

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

echo Backend setup complete
echo.

REM Frontend setup
echo Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

echo Frontend setup complete
echo.

REM Start services
echo Starting services...
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start backend
cd ..\backend
start "SecureCom Backend" cmd /k "venv\Scripts\activate && python -m app.main"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
cd ..\frontend
start "SecureCom Frontend" cmd /k "npm run dev"

echo.
echo Services started! Check the new windows for logs.
pause
