"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleTestLogin = () => {
    setIsLoading(true)
    
    // Mock user data
    const userData = {
      id: 1,
      name: 'John Doe',
      email: 'admin@example.com',
      loginTime: new Date().toISOString()
    }

    // Save to localStorage
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userData', JSON.stringify(userData))

    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  const handleClearStorage = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userData')
    localStorage.removeItem('authToken')
    alert('Penyimpanan dibersihkan!')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tes Sistem Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTestLogin} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sedang masuk...' : 'Tes Login (Login Otomatis)'}
          </Button>
          
          <Button 
            onClick={handleClearStorage} 
            variant="outline"
            className="w-full"
          >
            Bersihkan Penyimpanan
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>Ini akan:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Mengatur status login di localStorage</li>
              <li>Mengarahkan ke /dashboard</li>
              <li>Menampilkan menu user di navbar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
