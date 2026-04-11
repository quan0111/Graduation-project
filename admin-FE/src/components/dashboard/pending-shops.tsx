"use client"

import { Check, X, Eye, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const pendingShops = [
  {
    id: 1,
    name: "Thời trang Hà Nội",
    owner: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    category: "Thời trang",
    submittedAt: "2 giờ trước",
    documents: "Đầy đủ",
  },
  {
    id: 2,
    name: "Điện tử Sài Gòn",
    owner: "Trần Thị B",
    email: "tranthib@gmail.com",
    category: "Điện tử",
    submittedAt: "5 giờ trước",
    documents: "Đầy đủ",
  },
  {
    id: 3,
    name: "Mỹ phẩm Đà Nẵng",
    owner: "Lê Văn C",
    email: "levanc@gmail.com",
    category: "Làm đẹp",
    submittedAt: "1 ngày trước",
    documents: "Thiếu CCCD",
  },
  {
    id: 4,
    name: "Đồ gia dụng Pro",
    owner: "Phạm Thị D",
    email: "phamthid@gmail.com",
    category: "Gia dụng",
    submittedAt: "1 ngày trước",
    documents: "Đầy đủ",
  },
]

export function PendingShops() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Shop chờ duyệt</CardTitle>
          <CardDescription className="text-muted-foreground">
            12 shop đang chờ phê duyệt
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="text-foreground">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingShops.map((shop) => (
            <div
              key={shop.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar className="size-10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {shop.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{shop.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {shop.owner} • {shop.email}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {shop.category}
                    </Badge>
                    <Badge
                      variant={shop.documents === "Đầy đủ" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {shop.documents}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="mr-4 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {shop.submittedAt}
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
