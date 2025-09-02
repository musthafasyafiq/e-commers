@echo off
echo ========================================
echo Push ke GitHub - Modern E-Commerce Platform
echo ========================================

echo.
echo Checking Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Git tidak terinstall!
    echo Download dari: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Git OK!
echo.

echo Inisialisasi Git repository...
git init

echo.
echo Menambahkan semua file...
git add .

echo.
echo Membuat commit...
git commit -m "Initial commit: Modern E-Commerce Platform - Full-stack e-commerce dengan Next.js dan NestJS"

echo.
echo ========================================
echo Setup selesai!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Buat repository baru di GitHub
echo 2. Copy URL repository
echo 3. Jalankan perintah:
echo    git remote add origin [URL_REPO]
echo    git branch -M main  
echo    git push -u origin main
echo.
pause
