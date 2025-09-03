const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify SMTP connection
async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified');
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error.message);
    console.log('💡 Make sure to use Gmail App Password, not regular password');
  }
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: {
      name: 'E-Commerce Platform',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: '🔐 Kode OTP Verifikasi Anda',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">🛒 E-Commerce Platform</h1>
          </div>
          
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Kode Verifikasi OTP</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Halo! Kami menerima permintaan untuk verifikasi akun Anda. Gunakan kode OTP di bawah ini:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⚠️ <strong>Penting:</strong> Kode ini berlaku selama <strong>5 menit</strong> dan hanya dapat digunakan sekali.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 25px;">
            Jika Anda tidak meminta kode ini, abaikan email ini. Kode akan kedaluwarsa secara otomatis.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
          </p>
        </div>
      </div>
    `,
    text: `
      Kode OTP Verifikasi Anda: ${otp}
      
      Kode ini berlaku selama 5 menit dan hanya dapat digunakan sekali.
      Jika Anda tidak meminta kode ini, abaikan email ini.
      
      - E-Commerce Platform
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    throw new Error('Gagal mengirim email OTP');
  }
}

module.exports = {
  transporter,
  verifyEmailConnection,
  sendOTPEmail
};
