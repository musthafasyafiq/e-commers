# 🛒 E-Commerce OTP Email System

Sistem pengiriman OTP via email menggunakan Gmail SMTP dengan Nodemailer untuk platform e-commerce.

## 🚀 Tech Stack

- **Backend**: Node.js + Express
- **Database**: MySQL
- **Email Service**: Gmail SMTP + Nodemailer
- **Security**: bcrypt, JWT
- **Environment**: dotenv

## 📋 Features

- ✅ **Send OTP**: Kirim kode OTP 6 digit ke email user
- ✅ **Verify OTP**: Verifikasi kode dengan tracking percobaan
- ✅ **Attempt Limiting**: Blokir setelah 3x salah input
- ✅ **Auto Expiry**: OTP kedaluwarsa setelah 5 menit
- ✅ **Email Templates**: Template HTML yang menarik
- ✅ **Rate Limiting**: Mencegah spam OTP
- ✅ **Auto Cleanup**: Hapus OTP yang kedaluwarsa otomatis

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Database Setup

1. Buat database MySQL:
```sql
CREATE DATABASE ecommerce;
```

2. Import schema:
```bash
mysql -u root -p ecommerce < database/schema.sql
```

### 3. Gmail App Password Setup

1. Buka [Google Account Settings](https://myaccount.google.com/)
2. Pilih **Security** → **2-Step Verification** (aktifkan jika belum)
3. Pilih **App passwords**
4. Generate password untuk "Mail"
5. Salin password yang dihasilkan

### 4. Environment Variables

Buat file `.env` dari `.env.example`:

```bash
cp .env.example .env
```

Edit file `.env`:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce

# Gmail SMTP
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 5. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "signin" // signin | signup | reset_password
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kode OTP telah dikirim ke email Anda",
  "data": {
    "email": "user@example.com",
    "expiresIn": "5 menit",
    "type": "signin"
  }
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "type": "signin"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login berhasil!",
  "data": {
    "user": {
      "id": 1,
      "name": "User Name",
      "email": "user@example.com",
      "is_verified": true
    },
    "type": "signin"
  }
}
```

**Response (Failed):**
```json
{
  "success": false,
  "message": "Kode OTP salah. Sisa percobaan: 2",
  "data": {
    "attemptsLeft": 2,
    "shouldRequestNewOTP": false
  }
}
```

### Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "signin"
}
```

## 🔒 Security Features

### OTP Security
- **6-digit random code**: Menggunakan Math.random() yang aman
- **5 menit expiry**: OTP otomatis kedaluwarsa
- **Single use**: OTP hanya bisa dipakai sekali
- **Attempt limiting**: Maksimal 3x percobaan salah
- **Auto blocking**: Blokir OTP setelah batas percobaan

### Email Security
- **Gmail App Password**: Menggunakan App Password, bukan password biasa
- **TLS encryption**: Koneksi SMTP terenkripsi
- **HTML templates**: Template email yang aman dari XSS

### Database Security
- **Prepared statements**: Mencegah SQL injection
- **Password hashing**: bcrypt dengan salt rounds 10
- **Index optimization**: Query yang optimal

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OTP Codes Table
```sql
CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type ENUM('signup', 'signin', 'reset_password'),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  is_used BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  expired_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Manual Testing

1. **Send OTP**:
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"signin"}'
```

2. **Verify OTP**:
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","type":"signin"}'
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

## 🔧 Troubleshooting

### Gmail SMTP Issues
- ✅ Pastikan menggunakan **App Password**, bukan password biasa
- ✅ Aktifkan **2-Step Verification** di Google Account
- ✅ Periksa koneksi internet dan firewall

### Database Issues
- ✅ Pastikan MySQL service berjalan
- ✅ Periksa kredensial database di `.env`
- ✅ Import schema database dengan benar

### Email Tidak Terkirim
- ✅ Periksa folder **Spam/Junk** di email
- ✅ Verifikasi Gmail App Password
- ✅ Cek log server untuk error details

## 📈 Monitoring

Server menyediakan endpoint monitoring:

- **Health Check**: `GET /api/health`
- **OTP Stats**: `GET /api/auth/otp-stats/:email` (development only)

## 🚀 Production Deployment

1. Set `NODE_ENV=production` di `.env`
2. Gunakan process manager seperti PM2
3. Setup reverse proxy dengan Nginx
4. Enable SSL/HTTPS
5. Setup database backup
6. Monitor logs dan performance

## 📝 Integration dengan Frontend

Contoh integrasi dengan frontend React/Next.js:

```javascript
// Send OTP
const sendOTP = async (email) => {
  const response = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type: 'signin' })
  });
  return response.json();
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, type: 'signin' })
  });
  return response.json();
};
```

## 📞 Support

Jika mengalami masalah, periksa:
1. Log server di console
2. Database connection
3. Gmail App Password configuration
4. Network connectivity

---

**Happy Coding! 🎉**
