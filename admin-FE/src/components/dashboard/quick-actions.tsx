"use client"

import { Plus, FileText, Download, Settings, Users, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const actions = [
  {
    title: "Thêm shop mới",
    description: "Tạo shop cho seller",
    icon: Plus,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    title: "Xuất báo cáo",
    description: "Tải báo cáo Excel",
    icon: Download,
    color: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  },
  {
    title: "Quản lý quyền",
    description: "Phân quyền admin",
    icon: Shield,
    color: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
  },
  {
    title: "Người dùng VIP",
    description: "Quản lý VIP",
    icon: Users,
    color: "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20",
  },
  {
    title: "Chính sách",
    description: "Cập nhật quy định",
    icon: FileText,
    color: "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20",
  },
  {
    title: "Cài đặt hệ thống",
    description: "Cấu hình platform",
    icon: Settings,
    color: "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20",
  },
]

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Thao tác nhanh</CardTitle>
        <CardDescription className="text-muted-foreground">
          Các chức năng thường dùng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className={`h-auto flex-col gap-2 p-4 ${action.color}`}
            >
              <action.icon className="size-6" />
              <div className="text-center">
                <p className="text-sm font-medium">{action.title}</p>
                <p className="text-xs opacity-70">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
