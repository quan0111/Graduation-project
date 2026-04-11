"use client"

import { Check, X, Eye, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const pendingProducts = [
  {
    id: 1,
    name: "Áo thun nam premium cotton",
    shop: "Thời trang Hà Nội",
    price: "₫299,000",
    category: "Thời trang",
    submittedAt: "30 phút trước",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Tai nghe Bluetooth TWS Pro",
    shop: "Điện tử Sài Gòn",
    price: "₫890,000",
    category: "Điện tử",
    submittedAt: "1 giờ trước",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Set skincare dưỡng da ban đêm",
    shop: "Mỹ phẩm Đà Nẵng",
    price: "₫1,250,000",
    category: "Làm đẹp",
    submittedAt: "2 giờ trước",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Nồi chiên không dầu 5L",
    shop: "Đồ gia dụng Pro",
    price: "₫2,500,000",
    category: "Gia dụng",
    submittedAt: "3 giờ trước",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    name: "Giày sneaker thể thao",
    shop: "Sport Zone",
    price: "₫1,890,000",
    category: "Giày dép",
    submittedAt: "4 giờ trước",
    image: "/placeholder.svg",
  },
]

export function PendingProducts() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Sản phẩm chờ duyệt</CardTitle>
          <CardDescription className="text-muted-foreground">
            48 sản phẩm đang chờ phê duyệt
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="text-foreground">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{product.shop}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {product.price}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="mr-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {product.submittedAt}
                </div>
                <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground">
                  <Eye className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="size-8 text-primary hover:bg-primary/20">
                  <Check className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="size-8 text-destructive hover:bg-destructive/20">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
