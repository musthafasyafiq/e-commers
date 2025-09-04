"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyOTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    // Get pending registration data
    const pendingEmail = localStorage.getItem('pendingEmail')
    const pendingName = localStorage.getItem('pendingName')
    
    if (!pendingEmail || !pendingName) {
      router.push('/signup')
      return
    }
    
    setEmail(pendingEmail)
    setName(pendingName)

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      setError('Kode OTP harus 6 digit')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear pending data
        localStorage.removeItem('pendingEmail')
        localStorage.removeItem('pendingName')
        
        // Show success and redirect
        router.push('/login?verified=true')
      } else {
        setError(data.message || 'Kode OTP tidak valid')
        setAttempts(prev => prev + 1)
        setOtp('')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setCanResend(false)
        setCountdown(30)
        setAttempts(0)
        setOtp('')
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              setCanResend(true)
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.message || 'Gagal mengirim ulang OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifikasi OTP</CardTitle>
          <CardDescription>
            Kami telah mengirimkan kode 6 digit ke email <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {attempts >= 3 && (
              <Alert className="rounded-xl border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Anda telah gagal 3 kali. Jika lupa password, silakan{' '}
                  <Link href="/reset-password" className="underline font-medium">
                    reset password
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Kode OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={handleOtpChange}
                className="text-center text-2xl font-mono tracking-widest rounded-xl"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground text-center">
                Masukkan 6 digit kode yang dikirim ke email Anda
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </Button>

            <div className="flex items-center justify-between pt-4 border-t">
              <Link 
                href="/signup" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </Link>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={!canResend || isResending}
                className="text-sm"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Mengirim...
                  </>
                ) : canResend ? (
                  'Kirim Ulang OTP'
                ) : (
                  `Kirim ulang dalam ${countdown}s`
                )}
              </Button>
            </div>
          </form>

          {/* Help text */}
          <div className="mt-6 p-4 bg-muted rounded-xl">
            <p className="text-sm font-medium mb-2">Tidak menerima kode?</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Periksa folder spam/junk email</li>
              <li>• Pastikan email yang dimasukkan benar</li>
              <li>• Tunggu hingga 2 menit untuk pengiriman</li>
              <li>• Klik "Kirim Ulang OTP" jika diperlukan</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
