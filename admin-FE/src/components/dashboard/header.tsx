"use client"

import { Bell, Search, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const notifications = [
  {
    id: 1,
    title: "Shop mới chờ duyệt",
    description: "\"Thời trang Hà Nội\" đang chờ phê duyệt",
    time: "2 phút trước",
    unread: true,
  },
  {
    id: 2,
    title: "Sản phẩm vi phạm",
    description: "Phát hiện 3 sản phẩm vi phạm chính sách",
    time: "15 phút trước",
    unread: true,
  },
  {
    id: 3,
    title: "Báo cáo doanh thu",
    description: "Báo cáo doanh thu tháng 3 đã sẵn sàng",
    time: "1 giờ trước",
    unread: false,
  },
]

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm shop, sản phẩm, người dùng..."
            className="w-80 bg-secondary border-border pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="size-5" />
              <Badge className="absolute -right-1 -top-1 size-5 rounded-full bg-primary p-0 text-xs text-primary-foreground">
                3
              </Badge>
              <span className="sr-only">Thông báo</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover border-border">
            <DropdownMenuLabel className="text-foreground">Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-accent"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-foreground">
                    {notification.title}
                  </span>
                  {notification.unread && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {notification.description}
                </span>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer focus:bg-accent focus:text-primary">
              Xem tất cả thông báo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
