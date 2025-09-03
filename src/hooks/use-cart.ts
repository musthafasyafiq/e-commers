"use client"

import { useState, useEffect } from 'react'
import { cartService, type CartItem, type Product } from '@/lib/products'

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load cart items on mount
    const items = cartService.getCartItems()
    setCartItems(items)
    setIsLoading(false)
  }, [])

  const addToCart = (product: Product, quantity: number = 1) => {
    cartService.addToCart(product, quantity)
    const updatedItems = cartService.getCartItems()
    setCartItems(updatedItems)
  }

  const updateCartItem = (itemId: string, quantity: number) => {
    cartService.updateCartItem(itemId, quantity)
    const updatedItems = cartService.getCartItems()
    setCartItems(updatedItems)
  }

  const removeFromCart = (itemId: string) => {
    cartService.removeFromCart(itemId)
    const updatedItems = cartService.getCartItems()
    setCartItems(updatedItems)
  }

  const clearCart = () => {
    cartService.clearCart()
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartService.getCartTotal()
  }

  const getCartItemCount = () => {
    return cartService.getCartItemCount()
  }

  return {
    cartItems,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount
  }
}
