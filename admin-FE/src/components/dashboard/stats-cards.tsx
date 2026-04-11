"use client"

import { TrendingUp, TrendingDown, Store, Package, Users, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    title: "Tổng doanh thu",
    value: "₫12.5B",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "so với tháng trước",
  },
  {
    title: "Shop hoạt động",
    value: "1,284",
    change: "+8.2%",
    trend: "up",
    icon: Store,
    description: "12 shop chờ duyệt",
  },
  {
    title: "Sản phẩm",
    value: "45,678",
    change: "+15.3%",
    trend: "up",
    icon: Package,
    description: "48 sản phẩm chờ duyệt",
  },
  {
    title: "Người dùng",
    value: "89,432",
    change: "-2.4%",
    trend: "down",
    icon: Users,
    description: "1,234 người dùng mới",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon className="size-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up" ? "text-primary" : "text-destructive"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
