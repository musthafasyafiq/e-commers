"use client"

import { Header } from '@/components/layout/header'
import { Hero } from '@/components/home/hero'
import { FeaturedProducts } from '@/components/home/featured-products'
import { Categories } from '@/components/home/categories'
import { FlashSale } from '@/components/home/flash-sale'
import { Newsletter } from '@/components/home/newsletter'
import { Footer } from '@/components/layout/footer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Eye } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { ProductGrid } from "@/components/products/product-grid"
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const { t } = useTranslation()
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Selamat Datang, {user?.name}!
            </h1>
            <p className="text-lg opacity-90">
              Temukan produk terbaik atau mulai berjualan di marketplace kami
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              🛒 Mulai Berbelanja
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Jelajahi ribuan produk berkualitas dari penjual terpercaya
            </p>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                Elektronik
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                Fashion
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Gadget
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              💼 Mulai Berjualan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Jual produk Anda dan raih keuntungan maksimal dengan mudah
            </p>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                Gratis Daftar
              </span>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm">
                Komisi Rendah
              </span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Produk Terbaru
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Temukan produk terbaik untuk kebutuhan Anda
            </p>
          </div>
          
          <ProductGrid />
        </div>
      </div>
    </div>
  )
}
