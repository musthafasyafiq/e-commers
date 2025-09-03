"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { productService, type Product } from '@/lib/products'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface ProductGridProps {
  sellerId?: string
}

export function ProductGrid({ sellerId }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = sellerId 
          ? await productService.getProductsBySeller(sellerId)
          : await productService.getAllProducts()
        setProducts(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading products",
          description: "Failed to load products. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [sellerId, toast])

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Please login to add items to cart",
      })
      return
    }

    if (product.stock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of stock",
        description: "This product is currently out of stock",
      })
      return
    }

    addToCart(product, 1)
    toast({
      title: "Added to cart",
      description: `${product.product_name} has been added to your cart`,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p>There are no products available at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.image_url}
                alt={product.product_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              
              {/* Stock badge */}
              <div className="absolute top-2 left-2">
                {product.stock <= 0 ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : product.stock <= 5 ? (
                  <Badge variant="secondary">Low Stock</Badge>
                ) : null}
              </div>

              {/* Action buttons */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-col space-y-2">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="mb-2">
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {product.product_name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </div>
              </div>

              {product.seller_name && (
                <div className="text-xs text-muted-foreground mb-3">
                  Sold by: {product.seller_name}
                </div>
              )}
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full" 
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
