const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../config/email');

// Send OTP for signup or signin
router.post('/send-otp', async (req, res) => {
  try {
    const { email, type = 'signin', name, phone } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // For signup, check if user already exists
    if (type === 'signup') {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      
      // Validate signup fields
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name is required and must be at least 2 characters'
        });
      }
    }

    // For signin, check if user exists
    if (type === 'signin') {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'No account found with this email'
        });
      }
    }

    // Generate and save OTP
    const otpData = await OTP.create(email, type);
    
    // Send OTP via email
    await sendOTPEmail(email, otpData.code, name || 'User');
    
    res.json({
      success: true,
      message: `OTP sent successfully to ${email}`,
      expiresAt: otpData.expiresAt
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    
    // Handle rate limiting error
    if (error.message.includes('Too many OTP requests')) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait before requesting again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// Verify OTP and complete signup/signin
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code, type = 'signin', name, phone, password } = req.body;

    // Validate required fields
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required'
      });
    }

    // Validate OTP code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'OTP code must be 6 digits'
      });
    }

    // Verify OTP
    const otpResult = await OTP.verify(email, code, type);
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    let user;
    
    if (type === 'signup') {
      // Create new user
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name is required and must be at least 2 characters'
        });
      }
      
      user = await User.create({
        name: name.trim(),
        email,
        phone,
        password // Can be null for OTP-only signup
      });
      
      // Mark user as verified
      await User.verifyUser(email);
      
    } else if (type === 'signin') {
      // Get existing user
      user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Mark user as verified if not already
      if (!user.is_verified) {
        await User.verifyUser(email);
      }
    }

    // Get user profile (without sensitive data)
    const userProfile = await User.getProfile(email);
    
    res.json({
      success: true,
      message: `${type === 'signup' ? 'Account created' : 'Signed in'} successfully`,
      user: userProfile
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, type = 'signin' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user can request new OTP (rate limiting)
    const canRequest = await OTP.canRequestOTP(email, type);
    if (!canRequest) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait before requesting again.'
      });
    }

    // Generate new OTP
    const otpData = await OTP.create(email, type);
    
    // Get user name for email
    let userName = 'User';
    if (type === 'signin') {
      const user = await User.findByEmail(email);
      if (user) userName = user.name;
    }
    
    // Send OTP via email
    await sendOTPEmail(email, otpData.code, userName);
    
    res.json({
      success: true,
      message: `New OTP sent successfully to ${email}`,
      expiresAt: otpData.expiresAt
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
});

// Get OTP statistics (for monitoring)
router.get('/otp-stats/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const stats = await OTP.getStats(email);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('OTP stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP statistics'
    });
  }
});

module.exports = router;
