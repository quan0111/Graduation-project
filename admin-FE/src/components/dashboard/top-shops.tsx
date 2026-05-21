"use client"

import { ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0)

export function TopShops({ shops = [] }: { shops?: any[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Shop có doanh thu cao</CardTitle>
          <CardDescription className="text-muted-foreground">
            Các shop có doanh thu tốt nhất theo đơn hoàn tất
          </CardDescription>
        </div>
        <Link to="/analytics" className="rounded-md border px-3 py-1.5 text-sm text-foreground">
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Cửa hàng</TableHead>
              <TableHead className="text-muted-foreground">Doanh thu</TableHead>
              <TableHead className="text-muted-foreground text-center">Đơn hàng</TableHead>
              <TableHead className="text-muted-foreground text-center">Sản phẩm</TableHead>
              <TableHead className="text-muted-foreground text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.map((shop) => (
              <TableRow key={shop.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={shop.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {(shop.name || "S").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">Shop #{shop.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {formatCurrency(shop.revenue)}
                </TableCell>
                <TableCell className="text-center text-foreground">
                  {shop.orders || 0}
                </TableCell>
                <TableCell className="text-center text-foreground">
                  {shop.products || 0}
                </TableCell>
                <TableCell className="text-right">
                  <Link to="/analytics" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground">
                    <ExternalLink className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {!shops.length && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                  Chưa có doanh thu shop hoàn tất.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
