const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Create new user (for signup with OTP)
  static async create(userData) {
    try {
      const { name, email, phone, password, role = 'user' } = userData;
      
      // Hash password if provided (for signup with password)
      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }
      
      const [result] = await db.execute(
        'INSERT INTO users (name, email, phone, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?, FALSE)',
        [name, email, phone, passwordHash, role]
      );
      
      return {
        id: result.insertId,
        name,
        email,
        phone,
        role,
        is_verified: false,
        is_active: true
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Create user without password (OTP-only registration)
  static async createWithoutPassword(userData) {
    try {
      const { name, email, phone, role = 'user' } = userData;
      
      const [result] = await db.execute(
        'INSERT INTO users (name, email, phone, role, is_verified) VALUES (?, ?, ?, ?, FALSE)',
        [name, email, phone, role]
      );
      
      return {
        id: result.insertId,
        name,
        email,
        phone,
        role,
        is_verified: false,
        is_active: true
      };
    } catch (error) {
      console.error('Error creating user without password:', error);
      throw error;
    }
  }

  // Verify user (mark as verified after OTP confirmation)
  static async verifyUser(email) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET is_verified = TRUE WHERE email = ?',
        [email]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Set password after OTP verification
  static async setPassword(email, password) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const [result] = await db.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, email]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error setting password:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(email, newPassword) {
    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const [result] = await db.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, email]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user || !user.password_hash) return false;
      
      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  // Check if user exists
  static async exists(email) {
    try {
      const user = await this.findByEmail(email);
      return !!user;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      throw error;
    }
  }

  // Get user profile (without sensitive data)
  static async getProfile(email) {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, email, phone, role, is_verified, is_active, created_at FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

module.exports = User;
