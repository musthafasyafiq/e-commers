const { pool } = require('../config/database');

class OTP {
  // Generate 6-digit OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create new OTP record
  static async create(email, userId = null, type = 'signin') {
    const code = this.generateOTP();
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    try {
      // Deactivate any existing OTP for this email
      await pool.execute(
        'UPDATE otp_codes SET is_used = TRUE WHERE email = ? AND is_used = FALSE',
        [email]
      );
      
      const [result] = await pool.execute(
        'INSERT INTO otp_codes (user_id, email, code, type, expired_at) VALUES (?, ?, ?, ?, ?)',
        [userId, email, code, type, expiredAt]
      );
      
      return {
        id: result.insertId,
        code,
        expiredAt
      };
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  // Verify OTP code
  static async verify(email, code) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM otp_codes 
         WHERE email = ? AND code = ? AND is_used = FALSE AND is_blocked = FALSE 
         ORDER BY created_at DESC LIMIT 1`,
        [email, code]
      );

      if (!rows.length) {
        return { 
          success: false, 
          message: 'Kode OTP tidak valid atau sudah digunakan',
          shouldBlock: false 
        };
      }

      const otpRecord = rows[0];
      
      // Check if expired
      if (new Date(otpRecord.expired_at) < new Date()) {
        await this.markAsUsed(otpRecord.id);
        return { 
          success: false, 
          message: 'Kode OTP sudah kadaluarsa',
          shouldBlock: false 
        };
      }

      // Mark as used
      await this.markAsUsed(otpRecord.id);
      
      return { 
        success: true, 
        message: 'Kode OTP valid',
        otpRecord,
        shouldBlock: false 
      };
      
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  // Verify OTP with attempt tracking
  static async verifyWithAttempts(email, code) {
    try {
      // Get latest OTP record for this email
      const [rows] = await pool.execute(
        `SELECT * FROM otp_codes 
         WHERE email = ? AND is_used = FALSE AND is_blocked = FALSE 
         ORDER BY created_at DESC LIMIT 1`,
        [email]
      );

      if (!rows.length) {
        return { 
          success: false, 
          message: 'Tidak ada kode OTP aktif untuk email ini',
          shouldBlock: false,
          attemptsLeft: 0
        };
      }

      const otpRecord = rows[0];
      
      // Check if expired
      if (new Date(otpRecord.expired_at) < new Date()) {
        await this.markAsUsed(otpRecord.id);
        return { 
          success: false, 
          message: 'Kode OTP sudah kadaluarsa',
          shouldBlock: false,
          attemptsLeft: 0
        };
      }

      // Increment attempts
      const newAttempts = otpRecord.attempts + 1;
      await pool.execute(
        'UPDATE otp_codes SET attempts = ? WHERE id = ?',
        [newAttempts, otpRecord.id]
      );

      // Check if code is correct
      if (otpRecord.code === code) {
        await this.markAsUsed(otpRecord.id);
        return { 
          success: true, 
          message: 'Kode OTP valid',
          otpRecord,
          shouldBlock: false,
          attemptsLeft: otpRecord.max_attempts - newAttempts
        };
      }

      // Wrong code - check if should block
      const attemptsLeft = otpRecord.max_attempts - newAttempts;
      
      if (attemptsLeft <= 0) {
        // Block this OTP after max attempts
        await this.blockOTP(otpRecord.id);
        return { 
          success: false, 
          message: 'Kode OTP salah. Anda telah mencapai batas maksimal percobaan. Silakan minta kode baru.',
          shouldBlock: true,
          attemptsLeft: 0
        };
      }

      return { 
        success: false, 
        message: `Kode OTP salah. Sisa percobaan: ${attemptsLeft}`,
        shouldBlock: false,
        attemptsLeft
      };
      
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  // Mark OTP as used
  static async markAsUsed(otpId) {
    try {
      await pool.execute(
        'UPDATE otp_codes SET is_used = TRUE WHERE id = ?',
        [otpId]
      );
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  // Block OTP after max attempts
  static async blockOTP(otpId) {
    try {
      await pool.execute(
        'UPDATE otp_codes SET is_blocked = TRUE, is_used = TRUE WHERE id = ?',
        [otpId]
      );
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  // Clean up expired OTPs
  static async cleanupExpired() {
    try {
      const [result] = await pool.execute(
        'DELETE FROM otp_codes WHERE expired_at < NOW() AND is_used = FALSE'
      );
      console.log(`🧹 Cleaned up ${result.affectedRows} expired OTP codes`);
      return result.affectedRows;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error.message);
    }
  }

  // Get OTP statistics for monitoring
  static async getStats(email) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_otps,
          SUM(CASE WHEN is_used = TRUE THEN 1 ELSE 0 END) as used_otps,
          SUM(CASE WHEN is_blocked = TRUE THEN 1 ELSE 0 END) as blocked_otps,
          SUM(CASE WHEN expired_at < NOW() THEN 1 ELSE 0 END) as expired_otps
         FROM otp_codes WHERE email = ?`,
        [email]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }
}

module.exports = OTP;
