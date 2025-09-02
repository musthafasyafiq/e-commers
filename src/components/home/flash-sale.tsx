"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { motion } from "framer-motion"

const flashSaleProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Earbuds",
    originalPrice: 199000,
    salePrice: 99000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    rating: 4.5,
    reviews: 128,
    stock: 15,
    sold: 85
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    originalPrice: 899000,
    salePrice: 449000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 256,
    stock: 8,
    sold: 142
  },
  {
    id: 3,
    name: "Portable Phone Charger",
    originalPrice: 149000,
    salePrice: 74500,
    image: "https://images.unsplash.com/photo-1609592806955-d834c2d4c0b7?w=400&h=400&fit=crop",
    rating: 4.3,
    reviews: 89,
    stock: 23,
    sold: 67
  },
  {
    id: 4,
    name: "HD Webcam",
    originalPrice: 299000,
    salePrice: 179000,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 174,
    stock: 12,
    sold: 98
  }
]

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getDiscountPercentage = (original: number, sale: number) => {
    return Math.round(((original - sale) / original) * 100)
  }

  return (
    <section className="py-16 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-8 w-8 text-red-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-red-600">Flash Sale</h2>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Limited time offers - grab them before they're gone!
          </p>
          
          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="bg-red-500 text-white rounded-lg p-3 min-w-[60px]">
                <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Hours</div>
            </div>
            <div className="text-2xl font-bold text-red-500">:</div>
            <div className="text-center">
              <div className="bg-red-500 text-white rounded-lg p-3 min-w-[60px]">
                <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Minutes</div>
            </div>
            <div className="text-2xl font-bold text-red-500">:</div>
            <div className="text-center">
              <div className="bg-red-500 text-white rounded-lg p-3 min-w-[60px]">
                <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Seconds</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSaleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                      -{getDiscountPercentage(product.originalPrice, product.salePrice)}%
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Sold: {product.sold}</span>
                          <span>Stock: {product.stock}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(product.sold / (product.sold + product.stock)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-red-500 hover:bg-red-600" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/flash-sale">View All Flash Sale Items</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
