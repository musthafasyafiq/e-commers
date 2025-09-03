export interface Product {
  id: string
  seller_id: string
  product_name: string
  description: string
  price: number
  stock: number
  image_url: string
  created_at: string
  seller_name?: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

// Mock product data - replace with real API calls
export const mockProducts: Product[] = [
  {
    id: '1',
    seller_id: 'seller1',
    product_name: 'iPhone 15 Pro',
    description: 'Latest iPhone with advanced camera system and A17 Pro chip',
    price: 15999000,
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    created_at: '2024-01-15T10:00:00Z',
    seller_name: 'Tech Store'
  },
  {
    id: '2',
    seller_id: 'seller2',
    product_name: 'MacBook Air M3',
    description: 'Powerful laptop with M3 chip, perfect for work and creativity',
    price: 18999000,
    stock: 5,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    created_at: '2024-01-14T15:30:00Z',
    seller_name: 'Apple Store'
  },
  {
    id: '3',
    seller_id: 'seller1',
    product_name: 'Samsung Galaxy S24',
    description: 'Flagship Android phone with AI features and excellent camera',
    price: 12999000,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    created_at: '2024-01-13T09:15:00Z',
    seller_name: 'Tech Store'
  },
  {
    id: '4',
    seller_id: 'seller3',
    product_name: 'Sony WH-1000XM5',
    description: 'Premium noise-canceling headphones with exceptional sound quality',
    price: 4999000,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    created_at: '2024-01-12T14:20:00Z',
    seller_name: 'Audio Pro'
  },
  {
    id: '5',
    seller_id: 'seller2',
    product_name: 'iPad Pro 12.9"',
    description: 'Professional tablet with M2 chip and Liquid Retina display',
    price: 16999000,
    stock: 6,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    created_at: '2024-01-11T11:45:00Z',
    seller_name: 'Apple Store'
  },
  {
    id: '6',
    seller_id: 'seller3',
    product_name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with stunning InfinityEdge display',
    price: 22999000,
    stock: 4,
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    created_at: '2024-01-10T16:30:00Z',
    seller_name: 'Computer World'
  }
]

// Product service functions
export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockProducts
  },

  // Get products by seller
  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockProducts.filter(product => product.seller_id === sellerId)
  },

  // Get single product
  async getProduct(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockProducts.find(product => product.id === id) || null
  },

  // Add new product
  async addProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    }
    
    mockProducts.unshift(newProduct)
    return newProduct
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const index = mockProducts.findIndex(product => product.id === id)
    if (index === -1) return null
    
    mockProducts[index] = { ...mockProducts[index], ...updates }
    return mockProducts[index]
  },

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = mockProducts.findIndex(product => product.id === id)
    if (index === -1) return false
    
    mockProducts.splice(index, 1)
    return true
  }
}

// Cart service functions
export const cartService = {
  // Get cart items from localStorage
  getCartItems(): CartItem[] {
    try {
      const cartData = localStorage.getItem('cart_items')
      return cartData ? JSON.parse(cartData) : []
    } catch {
      return []
    }
  },

  // Add item to cart
  addToCart(product: Product, quantity: number = 1): void {
    const cartItems = this.getCartItems()
    const existingItem = cartItems.find(item => item.product.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.push({
        id: Math.random().toString(36).substr(2, 9),
        product,
        quantity
      })
    }
    
    localStorage.setItem('cart_items', JSON.stringify(cartItems))
  },

  // Update cart item quantity
  updateCartItem(itemId: string, quantity: number): void {
    const cartItems = this.getCartItems()
    const item = cartItems.find(item => item.id === itemId)
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(itemId)
      } else {
        item.quantity = quantity
        localStorage.setItem('cart_items', JSON.stringify(cartItems))
      }
    }
  },

  // Remove item from cart
  removeFromCart(itemId: string): void {
    const cartItems = this.getCartItems()
    const filteredItems = cartItems.filter(item => item.id !== itemId)
    localStorage.setItem('cart_items', JSON.stringify(filteredItems))
  },

  // Clear cart
  clearCart(): void {
    localStorage.removeItem('cart_items')
  },

  // Get cart total
  getCartTotal(): number {
    const cartItems = this.getCartItems()
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  },

  // Get cart item count
  getCartItemCount(): number {
    const cartItems = this.getCartItems()
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }
}
