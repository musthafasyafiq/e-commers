const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { verifyEmailConnection } = require('./config/email');
const authRoutes = require('./routes/auth');
const OTP = require('./models/OTP');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce OTP Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🛒 E-Commerce OTP Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sendOTP: 'POST /api/auth/send-otp',
      verifyOTP: 'POST /api/auth/verify-otp',
      resendOTP: 'POST /api/auth/resend-otp'
    },
    documentation: 'Check README.md for API documentation'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl
  });
});

// Cleanup expired OTPs every 10 minutes
setInterval(async () => {
  try {
    await OTP.cleanupExpired();
  } catch (error) {
    console.error('Error in OTP cleanup:', error.message);
  }
}, 10 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    // Verify email configuration
    await verifyEmailConnection();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
      console.log('📋 Available endpoints:');
      console.log('   GET  / - API information');
      console.log('   GET  /api/health - Health check');
      console.log('   POST /api/auth/send-otp - Send OTP');
      console.log('   POST /api/auth/verify-otp - Verify OTP');
      console.log('   POST /api/auth/resend-otp - Resend OTP');
      console.log('');
      console.log('💡 Make sure to:');
      console.log('   1. Create .env file with your Gmail credentials');
      console.log('   2. Run the database schema (database/schema.sql)');
      console.log('   3. Use Gmail App Password, not regular password');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
