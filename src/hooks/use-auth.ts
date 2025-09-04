"use client"

import React, { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated on mount
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const userData = localStorage.getItem('userData')
    
    if (isLoggedIn === 'true' && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('userData')
      }
    }
    
    setIsLoading(false)
  }, [])

  const signOut = () => {
    // Clear localStorage
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userData')
    localStorage.removeItem('authToken')
    
    // Update state
    setUser(null)
    setIsAuthenticated(false)
    
    // Redirect to login
    router.push('/login')
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signOut
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
