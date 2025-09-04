"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserData {
  id: number
  name: string
  email: string
  loginTime: string
}

export function useAuthProtection() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const storedUserData = localStorage.getItem('userData')

      if (isLoggedIn === 'true' && storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData)
          setUserData(parsedUserData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Error parsing user data:', error)
          logout()
        }
      } else {
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: UserData) => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userData', JSON.stringify(userData))
    setUserData(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userData')
    setUserData(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  const requireAuth = () => {
    if (isAuthenticated === false) {
      router.push('/login')
    }
  }

  const redirectIfAuthenticated = () => {
    if (isAuthenticated === true) {
      router.push('/dashboard')
    }
  }

  return {
    isAuthenticated,
    userData,
    login,
    logout,
    requireAuth,
    redirectIfAuthenticated
  }
}
