"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useToast } from '@/hooks/use-toast'

interface ProductFormData {
  product_name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
  tags: string[]
}

const categories = [
  'Elektronik',
  'Fashion',
  'Rumah & Taman',
  'Olahraga',
  'Buku',
  'Kesehatan',
  'Makanan',
  'Otomotif'
]

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image_url: '',
    tags: []
  })

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.product_name || !formData.description || !formData.price || !formData.category) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi"
      })
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock saving to localStorage for demo
      const existingProducts = JSON.parse(localStorage.getItem('seller_products') || '[]')
      const newProduct = {
        id: Date.now().toString(),
        ...formData,
        seller_name: 'Current Seller', // TODO: Get from auth context
        created_at: new Date().toISOString(),
        status: 'active'
      }
      
      existingProducts.push(newProduct)
      localStorage.setItem('seller_products', JSON.stringify(existingProducts))
      
      toast({
        title: "Berhasil!",
        description: "Produk berhasil ditambahkan"
      })
      
      router.push('/seller/dashboard')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan produk"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/seller/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dashboard</span>
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tambah Produk Baru
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Produk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="product_name">Nama Produk *</Label>
                      <Input
                        id="product_name"
                        value={formData.product_name}
                        onChange={(e) => handleInputChange('product_name', e.target.value)}
                        placeholder="Masukkan nama produk"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Deskripsi *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Jelaskan detail produk Anda"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Harga (Rp) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stok *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Kategori *</Label>
                      <Select onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gambar Produk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="image_url">URL Gambar</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => handleInputChange('image_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Masukkan URL gambar produk atau upload gambar
                      </p>
                    </div>
                    
                    <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag & drop gambar atau klik untuk upload
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF hingga 10MB
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2 mb-4">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Tambah tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        Tambah
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview & Actions */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Preview Produk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.image_url && (
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.jpg'
                          }}
                        />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-lg">
                        {formData.product_name || 'Nama Produk'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.description || 'Deskripsi produk akan muncul di sini'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        Rp {formData.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stok: {formData.stock}
                      </span>
                    </div>

                    {formData.category && (
                      <Badge variant="outline">{formData.category}</Badge>
                    )}

                    <div className="pt-4 space-y-3">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Produk'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/seller/dashboard')}
                      >
                        Batal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
