@echo off
echo ========================================
echo Konfigurasi Git untuk Push GitHub
echo ========================================

echo.
set /p username="Masukkan nama Anda: "
set /p email="Masukkan email Anda: "

echo.
echo Mengkonfigurasi Git...
git config --global user.name "%username%"
git config --global user.email "%email%"

echo.
echo Membuat commit...
git commit -m "Initial commit: Modern E-Commerce Platform - Full-stack marketplace dengan Next.js dan NestJS"

echo.
echo ========================================
echo Git berhasil dikonfigurasi!
echo ========================================
echo.
echo Nama: %username%
echo Email: %email%
echo.
echo Langkah selanjutnya:
echo 1. Buat repository di GitHub dengan nama: modern-ecommerce-platform
echo 2. Jalankan perintah berikut (ganti USERNAME dengan username GitHub Anda):
echo.
echo    git remote add origin https://github.com/USERNAME/modern-ecommerce-platform.git
echo    git branch -M main
echo    git push -u origin main
echo.
pause
