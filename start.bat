@echo off
echo Starting Lancera Platform...
echo.
echo [1/2] Starting Backend (port 5000)...
start "Lancera Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo [2/2] Starting Frontend (port 3000)...
start "Lancera Frontend" cmd /k "cd frontend && npm start"
echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
