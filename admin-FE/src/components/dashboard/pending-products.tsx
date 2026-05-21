"use client"

import { Clock, Eye } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0)

export function PendingProducts({ products = [] }: { products?: any[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Sản phẩm chờ duyệt</CardTitle>
          <CardDescription className="text-muted-foreground">
            {products.length} sản phẩm đang chờ phê duyệt
          </CardDescription>
        </div>
        <Link to="/products" className="rounded-md border px-3 py-1.5 text-sm text-foreground">
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{product.shop || "N/A"}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(product.price)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {product.category || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="mr-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {product.submittedAt ? new Date(product.submittedAt).toLocaleString("vi-VN") : "N/A"}
                </div>
                <Link to="/products" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground">
                  <Eye className="size-4" />
                </Link>
              </div>
            </div>
          ))}
          {!products.length && <p className="text-sm text-muted-foreground">Không có sản phẩm chờ duyệt.</p>}
        </div>
      </CardContent>
    </Card>
  )
}
