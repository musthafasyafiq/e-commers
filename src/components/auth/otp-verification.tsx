"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { otpService } from '@/lib/otp'
import { useToast } from '@/hooks/use-toast'

interface OTPVerificationProps {
  email: string
  userId: string
  onVerificationSuccess: () => void
  onForgotPassword: () => void
}

export function OTPVerification({ 
  email, 
  userId, 
  onVerificationSuccess, 
  onForgotPassword 
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && value) {
      handleVerifyOtp(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      setError('')
      handleVerifyOtp(pastedData)
    }
  }

  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await otpService.verifyOTP(userId, otpCode)
      
      if (result.success) {
        toast({
          title: "Verification successful!",
          description: "Your account has been verified.",
        })
        onVerificationSuccess()
      } else {
        setError(result.message)
        if (result.attemptsLeft !== undefined) {
          setAttemptsLeft(result.attemptsLeft)
        }
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    setError('')

    try {
      const canRequest = await otpService.canRequestNewOTP(userId)
      
      if (!canRequest.canRequest) {
        setError(`Please wait ${canRequest.waitTime} seconds before requesting a new OTP.`)
        return
      }

      await otpService.createOTP(userId, email)
      
      toast({
        title: "OTP sent!",
        description: "A new OTP has been sent to your email.",
      })
      
      // Reset states
      setOtp(['', '', '', '', '', ''])
      setAttemptsLeft(3)
      setCanResend(false)
      setCountdown(30)
      inputRefs.current[0]?.focus()
      
    } catch (error) {
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to<br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-semibold"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {attemptsLeft <= 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Too many failed attempts. You can request a new OTP or reset your password.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Verify Button */}
            <Button
              onClick={() => handleVerifyOtp(otp.join(''))}
              disabled={otp.some(digit => digit === '') || isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify OTP
            </Button>

            {/* Resend OTP */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              
              {canResend ? (
                <Button
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-primary hover:text-primary/80"
                >
                  {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend OTP
                </Button>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Resend in {countdown}s</span>
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
            {attemptsLeft <= 0 && (
              <div className="text-center pt-4 border-t">
                <Button
                  variant="link"
                  onClick={onForgotPassword}
                  className="text-primary hover:text-primary/80"
                >
                  Forgot Password?
                </Button>
              </div>
            )}

            {/* Back to Login */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth/signin')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
