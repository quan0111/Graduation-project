"use client"

import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const topShops = [
  {
    id: 1,
    name: "TechWorld Store",
    owner: "Nguyễn Minh Tuấn",
    revenue: "₫2.5B",
    orders: 12450,
    products: 856,
    rating: 4.9,
    change: "+18.5%",
    trend: "up",
    status: "Premium",
  },
  {
    id: 2,
    name: "Fashion Korea",
    owner: "Trần Thu Hà",
    revenue: "₫1.8B",
    orders: 9820,
    products: 1234,
    rating: 4.8,
    change: "+12.3%",
    trend: "up",
    status: "Premium",
  },
  {
    id: 3,
    name: "Beauty House VN",
    owner: "Lê Thị Mai",
    revenue: "₫1.2B",
    orders: 7650,
    products: 567,
    rating: 4.7,
    change: "+8.7%",
    trend: "up",
    status: "Verified",
  },
  {
    id: 4,
    name: "Home & Living",
    owner: "Phạm Văn Đức",
    revenue: "₫980M",
    orders: 5430,
    products: 892,
    rating: 4.6,
    change: "-2.1%",
    trend: "down",
    status: "Verified",
  },
  {
    id: 5,
    name: "Sport Zone",
    owner: "Hoàng Anh Khoa",
    revenue: "₫750M",
    orders: 4120,
    products: 445,
    rating: 4.5,
    change: "+5.4%",
    trend: "up",
    status: "Standard",
  },
]

export function TopShops() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Top Shop doanh thu cao</CardTitle>
          <CardDescription className="text-muted-foreground">
            Các shop có doanh thu tốt nhất tháng này
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="text-foreground">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Shop</TableHead>
              <TableHead className="text-muted-foreground">Doanh thu</TableHead>
              <TableHead className="text-muted-foreground text-center">Đơn hàng</TableHead>
              <TableHead className="text-muted-foreground text-center">Sản phẩm</TableHead>
              <TableHead className="text-muted-foreground text-center">Đánh giá</TableHead>
              <TableHead className="text-muted-foreground text-center">Tăng trưởng</TableHead>
              <TableHead className="text-muted-foreground text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topShops.map((shop) => (
              <TableRow key={shop.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {shop.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">{shop.owner}</p>
                    </div>
                    <Badge
                      variant={shop.status === "Premium" ? "default" : "secondary"}
                      className="ml-2 text-xs"
                    >
                      {shop.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {shop.revenue}
                </TableCell>
                <TableCell className="text-center text-foreground">
                  {shop.orders.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </TableCell>
                <TableCell className="text-center text-foreground">
                  {shop.products}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-foreground">{shop.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div
                    className={`inline-flex items-center gap-1 text-sm font-medium ${
                      shop.trend === "up" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {shop.trend === "up" ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {shop.change}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
