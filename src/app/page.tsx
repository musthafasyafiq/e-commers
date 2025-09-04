"use client"

import { useState } from "react"
import { Hero } from '@/components/home/hero'
import { FeaturedProducts } from '@/components/home/featured-products'
import { Categories } from '@/components/home/categories'
import { FlashSale } from '@/components/home/flash-sale'
import { Newsletter } from '@/components/home/newsletter'
import { Footer } from '@/components/layout/footer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Eye, Zap, Shield, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/layout/navbar"

// Mock product data for lobby
const featuredProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 299000,
    originalPrice: 399000,
    image: "/placeholder-product.jpg",
    rating: 4.8,
    reviews: 124,
    discount: 25,
    category: "Electronics"
  },
  {
    id: 2,
    name: "Premium Cotton T-Shirt",
    price: 149000,
    originalPrice: 199000,
    image: "/placeholder-product.jpg",
    rating: 4.6,
    reviews: 89,
    discount: 25,
    category: "Fashion"
  },
  {
    id: 3,
    name: "Smart Watch Series 5",
    price: 2499000,
    originalPrice: 2999000,
    image: "/placeholder-product.jpg",
    rating: 4.9,
    reviews: 256,
    discount: 17,
    category: "Electronics"
  },
  {
    id: 4,
    name: "Leather Backpack",
    price: 459000,
    originalPrice: 599000,
    image: "/placeholder-product.jpg",
    rating: 4.7,
    reviews: 67,
    discount: 23,
    category: "Fashion"
  }
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handlePurchaseClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      // Handle authenticated purchase
      console.log("Proceed to purchase")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Authenticated user homepage - Modern E-commerce Design
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <Hero />
        <FeaturedProducts />
        <Categories />
        <FlashSale />
        <Newsletter />
        <Footer />
      </div>
    )
  }

  // Unauthenticated user lobby - Modern E-commerce Design with Auth Gate
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Hero />
      
      {/* Modified Featured Products with Auth Gate */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Produk Pilihan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Dapatkan penawaran terbaik untuk produk berkualitas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {product.discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                      -{product.discount}%
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="flex space-x-2 w-full">
                  <Button 
                    onClick={handlePurchaseClick}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Beli Sekarang
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePurchaseClick}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button size="lg" onClick={handlePurchaseClick} className="px-8 py-3">
            Lihat Semua Produk
          </Button>
        </div>
      </div>

      <Categories />
      <FlashSale />
      <Newsletter />
      <Footer />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">🔐 Masuk atau Daftar</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Untuk melanjutkan pembelian, silakan masuk ke akun Anda atau buat akun baru
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <Link href="/auth/signin">
                <Button className="w-full" size="lg">
                  Masuk ke Akun
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full" size="lg">
                  Buat Akun Baru
                </Button>
              </Link>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
