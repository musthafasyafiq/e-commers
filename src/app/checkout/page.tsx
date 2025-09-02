"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, MapPin, Truck, Shield, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddressForm } from "@/components/checkout/address-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface CheckoutStep {
  id: string
  title: string
  completed: boolean
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderData, setOrderData] = useState({
    shippingAddress: null,
    billingAddress: null,
    paymentMethod: null,
    shippingMethod: "standard",
  })
  
  const router = useRouter()
  const { toast } = useToast()

  const steps: CheckoutStep[] = [
    { id: "shipping", title: "Shipping Address", completed: false },
    { id: "payment", title: "Payment Method", completed: false },
    { id: "review", title: "Review Order", completed: false },
  ]

  const handleStepComplete = (stepIndex: number, data: any) => {
    const updatedSteps = [...steps]
    updatedSteps[stepIndex].completed = true
    
    // Update order data based on step
    if (stepIndex === 0) {
      setOrderData(prev => ({ ...prev, ...data }))
    } else if (stepIndex === 1) {
      setOrderData(prev => ({ ...prev, paymentMethod: data }))
    }
    
    // Move to next step
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1)
    }
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    
    try {
      // TODO: Implement actual order placement API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly",
      })
      
      router.push("/orders/confirmation")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Steps */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index <= currentStep 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "border-muted-foreground text-muted-foreground"
                } ${step.completed ? "bg-green-500 border-green-500" : ""}`}>
                  {step.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-[2px] mx-4 ${
                    index < currentStep ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressForm
                    onSubmit={(data) => handleStepComplete(0, data)}
                    initialData={orderData.shippingAddress}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentForm
                    onSubmit={(data) => handleStepComplete(1, data)}
                    initialData={orderData.paymentMethod}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Address Review */}
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground">
                      {/* TODO: Display formatted address */}
                      <p>John Doe</p>
                      <p>123 Main Street</p>
                      <p>Jakarta, DKI Jakarta 12345</p>
                      <p>Indonesia</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(0)}
                      className="mt-2"
                    >
                      Edit Address
                    </Button>
                  </div>

                  <Separator />

                  {/* Payment Method Review */}
                  <div>
                    <h4 className="font-semibold mb-2">Payment Method</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>Credit Card ending in ****1234</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(1)}
                      className="mt-2"
                    >
                      Edit Payment
                    </Button>
                  </div>

                  <Separator />

                  {/* Shipping Method */}
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Method</h4>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm">Standard Shipping (3-5 business days)</span>
                      <Badge variant="secondary">FREE</Badge>
                    </div>
                  </div>

                  <Separator />

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          {currentStep < 2 && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
                disabled={!steps[currentStep]?.completed}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
