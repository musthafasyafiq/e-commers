"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  ShoppingCart, 
  Plus, 
  User, 
  LogOut, 
  Menu, 
  Store,
  Package,
  Settings
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
import { useTranslation } from '@/hooks/use-translation'
import { LanguageSwitcher } from '@/components/language-switcher'

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth()
  const { getCartItemCount } = useCart()
  const { t } = useTranslation()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const cartItemCount = getCartItemCount()

  const handleSignOut = () => {
    signOut()
    setIsMobileMenuOpen(false)
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Store },
    { name: 'Jual Produk', href: '/seller/add-product', icon: Plus },
    { name: 'Produk Saya', href: '/seller/products', icon: Package },
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              MarketPlace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/seller/add-product"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Jual Produk</span>
                </Link>
                <Link
                  href="/seller/products"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors flex items-center space-x-1"
                >
                  <Package className="h-4 w-4" />
                  <span>Produk Saya</span>
                </Link>
              </>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seller/products" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Produk Saya</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 pb-4 border-b">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback>
                            {user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      
                      <Link
                        href="/cart"
                        className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>Keranjang ({cartItemCount})</span>
                      </Link>
                      
                      <div className="pt-4 border-t">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start" 
                          onClick={handleSignOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
