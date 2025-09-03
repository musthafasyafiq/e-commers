export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'seller' | 'admin'
  avatar?: string
  phone?: string
  isVerified: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock authentication functions - replace with real API calls
export const authService = {
  // Sign up new user (now requires OTP verification)
  async signUp(data: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<{ user: User; requiresOTP: boolean }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if user already exists
    const existingUser = localStorage.getItem(`user_${data.email}`)
    if (existingUser) {
      throw new Error('User already exists')
    }
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      name: data.name,
      role: 'customer',
      phone: data.phone,
      isVerified: false,
      createdAt: new Date().toISOString()
    }
    
    // Store unverified user data
    localStorage.setItem(`unverified_user_${data.email}`, JSON.stringify({
      ...user,
      password_hash: `hashed_${data.password}`
    }))
    
    return { user, requiresOTP: true }
  },

  // Complete signup after OTP verification
  async completeSignUp(email: string): Promise<{ user: User; token: string }> {
    const unverifiedData = localStorage.getItem(`unverified_user_${email}`)
    if (!unverifiedData) {
      throw new Error('User data not found')
    }

    const userData = JSON.parse(unverifiedData)
    const user: User = {
      ...userData,
      isVerified: true
    }

    const token = 'mock_token_' + user.id

    // Move to verified users and clean up
    localStorage.setItem(`user_${email}`, JSON.stringify(user))
    localStorage.setItem('auth_token', token)
    localStorage.setItem('current_user', JSON.stringify(user))
    localStorage.removeItem(`unverified_user_${email}`)

    return { user, token }
  },

  // Sign in existing user (now requires OTP verification)
  async signIn(email: string, password: string): Promise<{ user: User; requiresOTP: boolean }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userData = localStorage.getItem(`user_${email}`)
    if (!userData) {
      throw new Error('User not found')
    }
    
    const user: User = JSON.parse(userData)
    
    // In real implementation, verify password hash here
    // For now, we'll assume password is correct and require OTP
    
    return { user, requiresOTP: true }
  },

  // Complete signin after OTP verification
  async completeSignIn(email: string): Promise<{ user: User; token: string }> {
    const userData = localStorage.getItem(`user_${email}`)
    if (!userData) {
      throw new Error('User not found')
    }

    const user: User = JSON.parse(userData)
    const token = 'mock_token_' + user.id

    localStorage.setItem('auth_token', token)
    localStorage.setItem('current_user', JSON.stringify(user))

    return { user, token }
  },

  // Get current user
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('current_user')
      const token = localStorage.getItem('auth_token')
      
      if (!userData || !token) return null
      
      return JSON.parse(userData)
    } catch {
      return null
    }
  },

  // Check if user exists
  async checkUserExists(email: string): Promise<boolean> {
    const userData = localStorage.getItem(`user_${email}`)
    return !!userData
  },

  // Sign out
  signOut(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('current_user')
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('current_user')
    return !!(token && user)
  }
}
