const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  // Create new user
  static async create(userData) {
    const { name, email, password, phone } = userData;
    
    try {
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, phone || null]
      );
      
      return {
        id: result.insertId,
        name,
        email,
        phone
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email sudah terdaftar');
      }
      throw new Error('Database error: ' + error.message);
    }
  }

  // Verify user account
  static async verifyUser(userId) {
    try {
      await pool.execute(
        'UPDATE users SET is_verified = TRUE WHERE id = ?',
        [userId]
      );
      return true;
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  // Update user password
  static async updatePassword(userId, newPassword) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      return true;
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Password verification error: ' + error.message);
    }
  }

  // Get user profile (without password)
  static async getProfile(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, email, phone, is_verified, created_at FROM users WHERE id = ?',
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }
}

module.exports = User;
