@echo off
echo ========================================
echo Modern E-Commerce Platform - Quick Deploy
echo ========================================

echo.
echo Starting Frontend (Next.js)...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Starting Backend (NestJS)...
start "Backend" cmd /k "cd /d %~dp0backend && npm run start:dev"

echo.
echo ========================================
echo Applications Starting...
echo ========================================
echo.
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:3002
echo API Docs: http://localhost:3002/api
echo.
echo Both applications will open in separate windows.
echo Press any key to continue...
pause >nul
