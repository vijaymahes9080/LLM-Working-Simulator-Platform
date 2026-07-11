@echo off
echo ===================================================
echo   LLM INSIDE - INTERACTIVE LLM SIMULATION PLATFORM
echo ===================================================
echo.

:: Check for backend virtual environment
if not exist "backend\.venv" (
    echo [ERROR] Python virtual environment not found in backend/.venv
    echo Please ensure the initial setup is complete.
    pause
    exit /b 1
)

:: Start Backend in a new window
echo [INFO] Starting FastAPI Backend on http://localhost:8000...
start "LLM Inside Backend" cmd /k "cd backend && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak > null

:: Start Frontend
echo [INFO] Starting Next.js Frontend on http://localhost:3000...
cd frontend
npm run dev

pause
