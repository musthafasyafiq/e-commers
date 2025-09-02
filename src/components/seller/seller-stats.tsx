"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatPrice } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface SellerStatsProps {
  stats: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    averageRating: number
    conversionRate: number
    pendingOrders: number
  }
}

export function SellerStats({ stats }: SellerStatsProps) {
  const metrics = [
    {
      title: "Monthly Revenue",
      value: formatPrice(stats.totalRevenue),
      change: "+12.5%",
      trend: "up" as const,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: "+8.2%",
      trend: "up" as const,
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      change: "+0.5%",
      trend: "up" as const,
    },
    {
      title: "Average Rating",
      value: `${stats.averageRating}/5`,
      change: "+0.1",
      trend: "up" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center space-x-2 text-xs">
              <Badge 
                variant={metric.trend === "up" ? "default" : "destructive"}
                className="text-xs"
              >
                {metric.change}
              </Badge>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
