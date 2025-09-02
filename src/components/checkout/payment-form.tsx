"use client"

import { useState } from "react"
import { CreditCard, Smartphone, Building2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface PaymentMethod {
  type: "credit_card" | "bank_transfer" | "e_wallet" | "cod"
  provider?: string
  details?: any
}

interface PaymentFormProps {
  onSubmit: (data: PaymentMethod) => void
  initialData?: PaymentMethod | null
}

export function PaymentForm({ onSubmit, initialData }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(initialData?.type || "credit_card")
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let paymentData: PaymentMethod = { type: selectedMethod as any }

      if (selectedMethod === "credit_card") {
        if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
          toast({
            variant: "destructive",
            title: "Missing card details",
            description: "Please fill in all card information",
          })
          return
        }
        paymentData.details = cardData
      }

      // TODO: Process payment method with backend
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onSubmit(paymentData)
      
      toast({
        title: "Payment method saved",
        description: "Your payment method has been saved successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save payment method. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
        {/* Credit Card */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="credit_card" id="credit_card" />
            <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4" />
              Credit/Debit Card
            </Label>
          </div>
          
          {selectedMethod === "credit_card" && (
            <Card className="ml-6">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData(prev => ({ 
                      ...prev, 
                      number: formatCardNumber(e.target.value) 
                    }))}
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData(prev => ({ 
                        ...prev, 
                        expiry: formatExpiry(e.target.value) 
                      }))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({ 
                        ...prev, 
                        cvv: e.target.value.replace(/\D/g, '') 
                      }))}
                      maxLength={4}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={(e) => setCardData(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                  />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Bank Transfer */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
            <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-4 w-4" />
              Bank Transfer
            </Label>
          </div>
          
          {selectedMethod === "bank_transfer" && (
            <Card className="ml-6">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You will receive bank transfer instructions after placing your order.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Supported Banks:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>• BCA</span>
                      <span>• Mandiri</span>
                      <span>• BNI</span>
                      <span>• BRI</span>
                      <span>• CIMB Niaga</span>
                      <span>• Permata</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* E-Wallet */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="e_wallet" id="e_wallet" />
            <Label htmlFor="e_wallet" className="flex items-center gap-2 cursor-pointer">
              <Smartphone className="h-4 w-4" />
              E-Wallet
            </Label>
          </div>
          
          {selectedMethod === "e_wallet" && (
            <Card className="ml-6">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred e-wallet for quick and secure payment.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["GoPay", "OVO", "DANA", "LinkAja", "ShopeePay", "Jenius"].map((wallet) => (
                      <Button
                        key={wallet}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        {wallet}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Cash on Delivery */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cod" id="cod" />
            <Label htmlFor="cod" className="cursor-pointer">
              Cash on Delivery (COD)
            </Label>
          </div>
          
          {selectedMethod === "cod" && (
            <Card className="ml-6">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Pay with cash when your order is delivered to your doorstep.
                  </p>
                  <p className="text-sm font-medium text-amber-600">
                    Additional COD fee: Rp 5,000
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </RadioGroup>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Payment Method & Continue"}
      </Button>
    </form>
  )
}
