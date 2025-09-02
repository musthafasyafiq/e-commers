"use client"

import { useState } from "react"
import Image from "next/image"
import { MoreHorizontal, Edit, Eye, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  category: string
  image: string
  sales: number
}

export function ProductsTable() {
  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      sku: "WBH-001",
      price: 299000,
      stock: 15,
      status: "active",
      category: "Electronics",
      image: "/placeholder-product.jpg",
      sales: 45,
    },
    {
      id: "2",
      name: "Premium Cotton T-Shirt",
      sku: "PCT-002",
      price: 149000,
      stock: 0,
      status: "out_of_stock",
      category: "Fashion",
      image: "/placeholder-product.jpg",
      sales: 23,
    },
    {
      id: "3",
      name: "Smart Watch Series 5",
      sku: "SWS-003",
      price: 1299000,
      stock: 8,
      status: "active",
      category: "Electronics",
      image: "/placeholder-product.jpg",
      sales: 12,
    },
  ])

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sales</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{product.sku}</TableCell>
              <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
              <TableCell>
                <span className={product.stock === 0 ? "text-red-600" : ""}>
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(product.status)}</TableCell>
              <TableCell>{product.sales} sold</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
