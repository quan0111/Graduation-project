"use client"

import { Store, Package, User, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const activities = [
  {
    id: 1,
    type: "shop_approved",
    message: "Shop \"TechWorld Store\" đã được phê duyệt",
    time: "5 phút trước",
    icon: CheckCircle,
    color: "text-primary",
  },
  {
    id: 2,
    type: "product_pending",
    message: "Sản phẩm mới từ \"Fashion Korea\" đang chờ duyệt",
    time: "15 phút trước",
    icon: Package,
    color: "text-chart-2",
  },
  {
    id: 3,
    type: "user_registered",
    message: "Người dùng mới: nguyenvana@gmail.com đã đăng ký",
    time: "30 phút trước",
    icon: User,
    color: "text-chart-3",
  },
  {
    id: 4,
    type: "shop_rejected",
    message: "Shop \"Fake Products\" đã bị từ chối - Vi phạm chính sách",
    time: "1 giờ trước",
    icon: XCircle,
    color: "text-destructive",
  },
  {
    id: 5,
    type: "report",
    message: "Báo cáo vi phạm mới từ người dùng về shop \"XYZ Store\"",
    time: "2 giờ trước",
    icon: AlertTriangle,
    color: "text-chart-5",
  },
  {
    id: 6,
    type: "shop_approved",
    message: "Shop \"Beauty House VN\" đã được phê duyệt",
    time: "3 giờ trước",
    icon: CheckCircle,
    color: "text-primary",
  },
  {
    id: 7,
    type: "product_approved",
    message: "50 sản phẩm từ \"Home & Living\" đã được duyệt",
    time: "4 giờ trước",
    icon: Package,
    color: "text-primary",
  },
  {
    id: 8,
    type: "user_registered",
    message: "Seller mới: tranthib@gmail.com đã đăng ký mở shop",
    time: "5 giờ trước",
    icon: Store,
    color: "text-chart-2",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Hoạt động gần đây</CardTitle>
        <CardDescription className="text-muted-foreground">
          Các hoạt động mới nhất trên hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className={`mt-0.5 ${activity.color}`}>
                  <activity.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
