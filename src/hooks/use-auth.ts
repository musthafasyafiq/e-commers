"use client"

import React, { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { authService, type User, type AuthState } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ requiresOTP: boolean; user: User }>
  signUp: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ requiresOTP: boolean; user: User }>
  signOut: () => void
  checkUserExists: (email: string) => Promise<boolean>
  completeOTPVerification: (email: string, isSignUp?: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated on mount
    const user = authService.getCurrentUser()
    const isAuthenticated = authService.isAuthenticated()
    
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated
    })
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const result = await authService.signIn(email, password)
      
      if (result.requiresOTP) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { requiresOTP: true, user: result.user }
      }
      
      setAuthState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true
      })
      
      // Redirect to home page after successful sign in
      router.push('/')
      return { requiresOTP: false, user: result.user }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const signUp = async (data: { name: string; email: string; password: string; phone?: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const result = await authService.signUp(data)
      
      if (result.requiresOTP) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { requiresOTP: true, user: result.user }
      }
      
      setAuthState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true
      })
      
      // Auto-redirect to home page after successful sign up
      router.push('/')
      return { requiresOTP: false, user: result.user }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const completeOTPVerification = async (email: string, isSignUp: boolean = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { user, token } = isSignUp 
        ? await authService.completeSignUp(email)
        : await authService.completeSignIn(email)
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      })
      
      // Redirect to home page after successful verification
      router.push('/')
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const signOut = () => {
    authService.signOut()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
    router.push('/auth/signin')
  }

  const checkUserExists = async (email: string): Promise<boolean> => {
    return await authService.checkUserExists(email)
  }

  const contextValue: AuthContextType = {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    signIn,
    signUp,
    signOut,
    checkUserExists,
    completeOTPVerification
  }

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
