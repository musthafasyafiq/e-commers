const db = require('../config/database');

class OTP {
  // Generate 6-digit OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create OTP record
  static async create(email, type = 'signin') {
    try {
      // Check rate limiting first
      const canRequest = await this.canRequestOTP(email, type);
      if (!canRequest) {
        throw new Error('Too many OTP requests. Please wait before requesting again.');
      }

      // Invalidate any existing OTP for this email and type
      await this.invalidateExisting(email, type);
      
      const code = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      
      const [result] = await db.execute(
        'INSERT INTO otp_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
        [email, code, type, expiresAt]
      );
      
      return {
        id: result.insertId,
        code,
        expiresAt,
        email,
        type
      };
    } catch (error) {
      console.error('Error creating OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  static async verify(email, code, type = 'signin') {
    try {
      // Get the OTP record
      const [rows] = await db.execute(
        `SELECT * FROM otp_codes 
         WHERE email = ? AND code = ? AND type = ? 
         AND is_used = FALSE AND is_blocked = FALSE 
         ORDER BY created_at DESC LIMIT 1`,
        [email, code, type]
      );
      
      if (rows.length === 0) {
        return { success: false, message: 'Invalid OTP code' };
      }
      
      const otpRecord = rows[0];
      
      // Check if OTP has expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        await this.markAsUsed(otpRecord.id);
        return { success: false, message: 'OTP has expired' };
      }
      
      // Check attempt limit before incrementing
      if (otpRecord.attempts >= otpRecord.max_attempts) {
        await this.blockOTP(otpRecord.id);
        return { success: false, message: 'Too many attempts. OTP blocked.' };
      }
      
      // Increment attempts first
      await db.execute(
        'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?',
        [otpRecord.id]
      );
      
      // Check if this was the last allowed attempt
      if (otpRecord.attempts + 1 >= otpRecord.max_attempts) {
        await this.blockOTP(otpRecord.id);
      } else {
        // Mark as used only if verification is successful
        await this.markAsUsed(otpRecord.id);
      }
      
      return { 
        success: true, 
        message: 'OTP verified successfully',
        otpId: otpRecord.id,
        email: otpRecord.email,
        type: otpRecord.type
      };
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Mark OTP as used
  static async markAsUsed(otpId) {
    try {
      await db.execute(
        'UPDATE otp_codes SET is_used = TRUE WHERE id = ?',
        [otpId]
      );
    } catch (error) {
      console.error('Error marking OTP as used:', error);
      throw error;
    }
  }

  // Block OTP (too many attempts)
  static async blockOTP(otpId) {
    try {
      await db.execute(
        'UPDATE otp_codes SET is_blocked = TRUE WHERE id = ?',
        [otpId]
      );
    } catch (error) {
      console.error('Error blocking OTP:', error);
      throw error;
    }
  }

  // Invalidate existing OTPs for email and type
  static async invalidateExisting(email, type) {
    try {
      await db.execute(
        'UPDATE otp_codes SET is_used = TRUE WHERE email = ? AND type = ? AND is_used = FALSE',
        [email, type]
      );
    } catch (error) {
      console.error('Error invalidating existing OTPs:', error);
      throw error;
    }
  }

  // Clean up expired OTPs (should be run periodically)
  static async cleanupExpired() {
    try {
      const [result] = await db.execute(
        'DELETE FROM otp_codes WHERE expires_at < NOW() AND is_used = FALSE'
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      throw error;
    }
  }

  // Get OTP statistics
  static async getStats(email) {
    try {
      const [rows] = await db.execute(
        `SELECT 
           COUNT(*) as total_otps,
           COUNT(CASE WHEN is_used = TRUE THEN 1 END) as used_otps,
           COUNT(CASE WHEN is_blocked = TRUE THEN 1 END) as blocked_otps,
           COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_otps
         FROM otp_codes 
         WHERE email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        [email]
      );
      
      return rows[0] || {
        total_otps: 0,
        used_otps: 0,
        blocked_otps: 0,
        expired_otps: 0
      };
    } catch (error) {
      console.error('Error getting OTP stats:', error);
      throw error;
    }
  }

  // Check if user can request new OTP (rate limiting)
  static async canRequestOTP(email, type = 'signin') {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) as recent_otps 
         FROM otp_codes 
         WHERE email = ? AND type = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
        [email, type]
      );
      
      const recentOTPs = rows[0].recent_otps;
      return recentOTPs < 3; // Max 3 OTPs per minute
    } catch (error) {
      console.error('Error checking OTP rate limit:', error);
      throw error;
    }
  }

  // Get active OTP for email and type
  static async getActiveOTP(email, type = 'signin') {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM otp_codes 
         WHERE email = ? AND type = ? 
         AND is_used = FALSE AND is_blocked = FALSE 
         AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [email, type]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error getting active OTP:', error);
      throw error;
    }
  }
}

module.exports = OTP;
