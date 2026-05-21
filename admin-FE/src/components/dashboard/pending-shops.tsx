"use client"

import { Clock, Eye } from "lucide-react"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PendingShops({ shops = [] }: { shops?: any[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Shop cho duyệt</CardTitle>
          <CardDescription className="text-muted-foreground">
            {shops.length} shop đang chờ phê duyệt
          </CardDescription>
        </div>
        <Link to="/seller-applications" className="rounded-md border px-3 py-1.5 text-sm text-foreground">
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar className="size-10">
                  <AvatarImage src={shop.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {(shop.name || "S").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{shop.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {shop.owner || "N/A"} - {shop.email || "N/A"}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {shop.documents || "Da gui"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="mr-4 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {shop.submittedAt ? new Date(shop.submittedAt).toLocaleString("vi-VN") : "N/A"}
                </div>
                <Link to="/seller-applications" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground">
                  <Eye className="size-4" />
                </Link>
              </div>
            </div>
          ))}
          {!shops.length && <p className="text-sm text-muted-foreground">Không có shop chờ duyệt.</p>}
        </div>
      </CardContent>
    </Card>
  )
}
