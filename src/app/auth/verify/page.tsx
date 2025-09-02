"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Phone, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Link from "next/link"

export default function VerifyPage() {
  const [emailCode, setEmailCode] = useState("")
  const [phoneCode, setPhoneCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: emailCode }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: data.message || "Invalid verification code",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          phone: localStorage.getItem("pendingPhone"), 
          otp: phoneCode 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Phone verified!",
          description: "Your phone number has been successfully verified",
        })
        router.push("/auth/signin")
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: data.message || "Invalid OTP code",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setResendCooldown(60)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: localStorage.getItem("pendingEmail"),
          type: "email"
        }),
      })

      if (response.ok) {
        toast({
          title: "Email sent!",
          description: "A new verification email has been sent",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend email",
      })
    }
  }

  const handleResendSMS = async () => {
    setResendCooldown(60)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          phone: localStorage.getItem("pendingPhone"),
          type: "phone"
        }),
      })

      if (response.ok) {
        toast({
          title: "SMS sent!",
          description: "A new OTP has been sent to your phone",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend SMS",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Verify your account</CardTitle>
            <CardDescription>
              Enter the verification codes sent to your email and phone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailCode">Email Verification Code</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="emailCode"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value)}
                        className="pl-10"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Verifying..."
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendEmail}
                      disabled={resendCooldown > 0}
                      className="text-sm"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {resendCooldown > 0 
                        ? `Resend in ${resendCooldown}s` 
                        : "Resend email"
                      }
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <form onSubmit={handlePhoneVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneCode">Phone Verification Code</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneCode"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="pl-10"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Verifying..."
                    ) : (
                      <>
                        Verify Phone
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendSMS}
                      disabled={resendCooldown > 0}
                      className="text-sm"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {resendCooldown > 0 
                        ? `Resend in ${resendCooldown}s` 
                        : "Resend SMS"
                      }
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <Link href="/auth/signin" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
