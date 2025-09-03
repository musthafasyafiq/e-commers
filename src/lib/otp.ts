export interface OTPCode {
  id: string
  user_id: string
  code: string
  expired_at: string
  attempts: number
  created_at: string
}

export interface PasswordReset {
  id: string
  user_id: string
  token: string
  expired_at: string
  created_at: string
}

// Mock OTP and password reset data - replace with real API calls
const mockOTPCodes: OTPCode[] = []
const mockPasswordResets: PasswordReset[] = []

// OTP service functions
export const otpService = {
  // Generate 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  },

  // Create OTP for user
  async createOTP(userId: string, email: string): Promise<{ code: string; id: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Remove existing OTP for this user
    const existingIndex = mockOTPCodes.findIndex(otp => otp.user_id === userId)
    if (existingIndex !== -1) {
      mockOTPCodes.splice(existingIndex, 1)
    }
    
    const code = this.generateOTP()
    const otpRecord: OTPCode = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      code,
      expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      attempts: 0,
      created_at: new Date().toISOString()
    }
    
    mockOTPCodes.push(otpRecord)
    
    // Simulate sending email
    console.log(`OTP sent to ${email}: ${code}`)
    
    return { code, id: otpRecord.id }
  },

  // Verify OTP
  async verifyOTP(userId: string, inputCode: string): Promise<{ success: boolean; message: string; attemptsLeft?: number }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const otpRecord = mockOTPCodes.find(otp => otp.user_id === userId)
    
    if (!otpRecord) {
      return { success: false, message: 'OTP not found. Please request a new one.' }
    }
    
    // Check if expired
    if (new Date() > new Date(otpRecord.expired_at)) {
      // Remove expired OTP
      const index = mockOTPCodes.findIndex(otp => otp.id === otpRecord.id)
      if (index !== -1) mockOTPCodes.splice(index, 1)
      return { success: false, message: 'OTP has expired. Please request a new one.' }
    }
    
    // Increment attempts
    otpRecord.attempts += 1
    
    if (otpRecord.code === inputCode) {
      // Remove used OTP
      const index = mockOTPCodes.findIndex(otp => otp.id === otpRecord.id)
      if (index !== -1) mockOTPCodes.splice(index, 1)
      return { success: true, message: 'OTP verified successfully!' }
    }
    
    const attemptsLeft = 3 - otpRecord.attempts
    
    if (attemptsLeft <= 0) {
      // Remove OTP after 3 failed attempts
      const index = mockOTPCodes.findIndex(otp => otp.id === otpRecord.id)
      if (index !== -1) mockOTPCodes.splice(index, 1)
      return { 
        success: false, 
        message: 'Too many failed attempts. OTP has been invalidated.',
        attemptsLeft: 0
      }
    }
    
    return { 
      success: false, 
      message: `Invalid OTP. ${attemptsLeft} attempts remaining.`,
      attemptsLeft
    }
  },

  // Check if user can request new OTP (rate limiting)
  async canRequestNewOTP(userId: string): Promise<{ canRequest: boolean; waitTime?: number }> {
    const otpRecord = mockOTPCodes.find(otp => otp.user_id === userId)
    
    if (!otpRecord) {
      return { canRequest: true }
    }
    
    const createdTime = new Date(otpRecord.created_at).getTime()
    const now = Date.now()
    const timeDiff = now - createdTime
    const waitTime = 30000 // 30 seconds
    
    if (timeDiff < waitTime) {
      return { 
        canRequest: false, 
        waitTime: Math.ceil((waitTime - timeDiff) / 1000)
      }
    }
    
    return { canRequest: true }
  }
}

// Password reset service functions
export const passwordResetService = {
  // Generate reset token
  generateResetToken(): string {
    return Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15)
  },

  // Create password reset request
  async createPasswordReset(userId: string, email: string): Promise<{ token: string; resetUrl: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Remove existing reset request for this user
    const existingIndex = mockPasswordResets.findIndex(reset => reset.user_id === userId)
    if (existingIndex !== -1) {
      mockPasswordResets.splice(existingIndex, 1)
    }
    
    const token = this.generateResetToken()
    const resetRecord: PasswordReset = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      token,
      expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      created_at: new Date().toISOString()
    }
    
    mockPasswordResets.push(resetRecord)
    
    const resetUrl = `${window.location.origin}/reset-password?token=${token}`
    
    // Simulate sending email
    console.log(`Password reset link sent to ${email}: ${resetUrl}`)
    
    return { token, resetUrl }
  },

  // Verify reset token
  async verifyResetToken(token: string): Promise<{ valid: boolean; userId?: string; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const resetRecord = mockPasswordResets.find(reset => reset.token === token)
    
    if (!resetRecord) {
      return { valid: false, message: 'Invalid or expired reset token.' }
    }
    
    // Check if expired
    if (new Date() > new Date(resetRecord.expired_at)) {
      // Remove expired token
      const index = mockPasswordResets.findIndex(reset => reset.id === resetRecord.id)
      if (index !== -1) mockPasswordResets.splice(index, 1)
      return { valid: false, message: 'Reset token has expired. Please request a new one.' }
    }
    
    return { valid: true, userId: resetRecord.user_id, message: 'Token is valid.' }
  },

  // Use reset token (invalidate after use)
  async useResetToken(token: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const index = mockPasswordResets.findIndex(reset => reset.token === token)
    if (index !== -1) {
      mockPasswordResets.splice(index, 1)
      return true
    }
    
    return false
  }
}
