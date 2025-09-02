# Modern E-Commerce Platform - GitHub Setup Script
# PowerShell script untuk setup Git dan push ke GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Modern E-Commerce Platform - Git Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git terdeteksi: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git tidak terinstall!" -ForegroundColor Red
    Write-Host "Silakan install Git terlebih dahulu:" -ForegroundColor Yellow
    Write-Host "1. Download dari: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. Install dengan setting default" -ForegroundColor Yellow
    Write-Host "3. Restart PowerShell dan jalankan script ini lagi" -ForegroundColor Yellow
    Read-Host "Tekan Enter untuk keluar"
    exit
}

Write-Host ""
Write-Host "🔧 Mengkonfigurasi Git..." -ForegroundColor Blue

# Configure Git (if not already configured)
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName) {
    $inputName = Read-Host "Masukkan nama Anda untuk Git"
    git config --global user.name "$inputName"
    Write-Host "✅ Nama Git dikonfigurasi: $inputName" -ForegroundColor Green
}

if (-not $userEmail) {
    $inputEmail = Read-Host "Masukkan email Anda untuk Git"
    git config --global user.email "$inputEmail"
    Write-Host "✅ Email Git dikonfigurasi: $inputEmail" -ForegroundColor Green
}

Write-Host ""
Write-Host "📁 Inisialisasi Git repository..." -ForegroundColor Blue

# Initialize Git repository
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository diinisialisasi" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository sudah ada" -ForegroundColor Green
}

# Add all files
Write-Host "📦 Menambahkan semua file..." -ForegroundColor Blue
git add .

# Create initial commit
Write-Host "Membuat commit pertama..." -ForegroundColor Blue
$commitMessage = @"
Initial commit: Modern E-Commerce Platform

🚀 Features:
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
- Comprehensive security measures

🛠️ Tech Stack:
- Frontend: Next.js, TypeScript, TailwindCSS
- Backend: NestJS, PostgreSQL, Redis
- Deployment: Docker, Nginx
- Testing: Jest, Cypress
"@

git commit -m "$commitMessage"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Git setup selesai!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Langkah selanjutnya untuk push ke GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Buat repository baru di GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Nama repository: modern-ecommerce-platform" -ForegroundColor White
Write-Host ""
Write-Host "3. Jalankan perintah berikut (ganti USERNAME dengan username GitHub Anda):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/USERNAME/modern-ecommerce-platform.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Atau gunakan GitHub CLI jika sudah terinstall:" -ForegroundColor White
Write-Host "   gh repo create modern-ecommerce-platform --public" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Read-Host "Tekan Enter untuk keluar"
