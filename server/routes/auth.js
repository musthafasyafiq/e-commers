const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../config/email');

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { email, type = 'signin' } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi'
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    // Check if user exists (for signin) or doesn't exist (for signup)
    const existingUser = await User.findByEmail(email);
    
    if (type === 'signin' && !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.'
      });
    }

    if (type === 'signup' && existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.'
      });
    }

    // Create OTP
    const userId = existingUser ? existingUser.id : null;
    const otpData = await OTP.create(email, userId, type);

    // Send OTP via email
    await sendOTPEmail(email, otpData.code);

    // Log the attempt
    console.log(`📧 OTP sent to ${email} (${type}): ${otpData.code}`);

    res.json({
      success: true,
      message: 'Kode OTP telah dikirim ke email Anda. Periksa kotak masuk dan folder spam.',
      data: {
        email,
        expiresIn: '5 menit',
        type
      }
    });

  } catch (error) {
    console.error('❌ Send OTP Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim kode OTP. Silakan coba lagi.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, type = 'signin' } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email dan kode OTP wajib diisi'
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP harus 6 digit angka'
      });
    }

    // Verify OTP with attempt tracking
    const verificationResult = await OTP.verifyWithAttempts(email, otp);

    if (!verificationResult.success) {
      const statusCode = verificationResult.shouldBlock ? 429 : 400;
      
      return res.status(statusCode).json({
        success: false,
        message: verificationResult.message,
        data: {
          attemptsLeft: verificationResult.attemptsLeft,
          shouldRequestNewOTP: verificationResult.shouldBlock
        }
      });
    }

    // OTP is valid - handle different types
    const user = await User.findByEmail(email);
    
    if (type === 'signin') {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Mark user as verified if not already
      if (!user.is_verified) {
        await User.verifyUser(user.id);
      }

      res.json({
        success: true,
        message: 'Login berhasil!',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            is_verified: true
          },
          type: 'signin'
        }
      });

    } else if (type === 'signup') {
      // For signup, the user should be created separately
      // This endpoint just verifies the email
      res.json({
        success: true,
        message: 'Email berhasil diverifikasi!',
        data: {
          email,
          verified: true,
          type: 'signup'
        }
      });

    } else if (type === 'reset_password') {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Kode OTP valid. Anda dapat mengatur ulang password.',
        data: {
          email,
          canResetPassword: true,
          type: 'reset_password'
        }
      });
    }

    // Log successful verification
    console.log(`✅ OTP verified for ${email} (${type})`);

  } catch (error) {
    console.error('❌ Verify OTP Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal memverifikasi kode OTP. Silakan coba lagi.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, type = 'signin' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi'
      });
    }

    // Check rate limiting (optional - prevent spam)
    // You can implement Redis-based rate limiting here

    // Get user if exists
    const user = await User.findByEmail(email);
    const userId = user ? user.id : null;

    // Create new OTP
    const otpData = await OTP.create(email, userId, type);

    // Send OTP via email
    await sendOTPEmail(email, otpData.code);

    console.log(`🔄 OTP resent to ${email} (${type}): ${otpData.code}`);

    res.json({
      success: true,
      message: 'Kode OTP baru telah dikirim ke email Anda.',
      data: {
        email,
        expiresIn: '5 menit',
        type
      }
    });

  } catch (error) {
    console.error('❌ Resend OTP Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim ulang kode OTP. Silakan coba lagi.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get OTP stats (for monitoring/debugging)
router.get('/otp-stats/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint hanya tersedia dalam mode development'
      });
    }

    const stats = await OTP.getStats(email);
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ OTP Stats Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik OTP'
    });
  }
});

module.exports = router;
