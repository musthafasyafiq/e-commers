@echo off
echo ========================================
echo Modern E-Commerce Platform - Git Setup
echo ========================================

echo.
echo Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed. Please install Git first:
    echo 1. Download Git from: https://git-scm.com/download/win
    echo 2. Install with default settings
    echo 3. Restart this script after installation
    pause
    exit /b 1
)

echo Git is installed!
echo.

echo Initializing Git repository...
git init

echo.
echo Adding all files...
git add .

echo.
echo Creating initial commit...
git commit -m "Initial commit: Modern E-Commerce Platform

Features:
- Next.js 14 frontend with TypeScript
- NestJS backend with TypeScript  
- TailwindCSS + shadcn/ui components
- Authentication system (JWT, social login)
- Product catalog with search & filtering
- Shopping cart & checkout system
- Payment integration (Midtrans/Stripe)
- Seller dashboard & marketplace
- Admin dashboard with analytics
- Docker containerization
- Comprehensive security measures"

echo.
echo ========================================
echo Git repository setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin [YOUR_REPO_URL]
echo 4. Run: git push -u origin main
echo.
echo Or use GitHub CLI if installed:
echo gh repo create modern-ecommerce --public
echo git push -u origin main
echo.
pause
