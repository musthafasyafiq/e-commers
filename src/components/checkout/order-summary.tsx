"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  quantity: number
  variant?: string
}

export function OrderSummary() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch cart items from API
    const mockItems: OrderItem[] = [
      {
        id: "1",
        name: "Wireless Bluetooth Headphones",
        image: "/placeholder-product.jpg",
        price: 299000,
        originalPrice: 399000,
        quantity: 1,
      },
      {
        id: "2",
        name: "Premium Cotton T-Shirt",
        image: "/placeholder-product.jpg",
        price: 149000,
        quantity: 2,
        variant: "Size: L, Color: Navy",
      }
    ]
    
    setOrderItems(mockItems)
    setLoading(false)
  }, [])

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 500000 ? 0 : 25000
  const tax = Math.round(subtotal * 0.11) // 11% VAT
  const total = subtotal + shipping + tax

  const savings = orderItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity)
    }
    return sum
  }, 0)

  if (loading) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-16 h-16 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-4">
          {orderItems.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {item.quantity}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">{item.variant}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {item.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                  <span className="text-sm font-medium">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({orderItems.length} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>
              {shipping === 0 ? "FREE" : formatPrice(shipping)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Tax (VAT 11%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          
          {savings > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>You save</span>
              <span>-{formatPrice(savings)}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        {shipping === 0 && (
          <div className="text-sm text-green-600 text-center">
            🎉 You qualify for free shipping!
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Final price will be confirmed at checkout
        </div>
      </CardContent>
    </Card>
  )
}
