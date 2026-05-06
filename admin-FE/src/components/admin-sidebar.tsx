import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Store,
  Package,
  BarChart3,
  Users,
  Settings,
  Bell,
  MessageSquare,
  Tag,
  FileText,
  LogOut,
  ShoppingCart,
  Grid3x3,
  Star,
  CreditCard,
  AlertTriangle,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const mainNavItems = [
  { title: "Tổng quan", icon: LayoutDashboard, href: "/" },
  { title: "Quản lý Shop", icon: Store, href: "/shops"},
  { title: "Duyệt sản phẩm", icon: Package, href: "/products" },
  { title: "Quản lý Đơn hàng", icon: ShoppingCart, href: "/orders" },
  { title: "Thống kê doanh thu", icon: BarChart3, href: "/analytics" },
  { title: "Phê duyệt người bán", icon: Users, href: "/seller-applications" },
  { title: "Quản lý người dùng", icon: Users, href: "/users" },
]

const contentNavItems = [
  { title: "Danh mục", icon: Grid3x3, href: "/categories" },
  { title: "Đánh giá", icon: Star, href: "/reviews", badge: 342 },
  { title: "Giao dịch", icon: CreditCard, href: "/transactions", badge: 185 },
  { title: "Vi phạm", icon: AlertTriangle, href: "/violations", badge: 42 },
]

const systemNavItems = [
  { title: "Thông báo", icon: Bell, href: "/notifications", badge: 23 },
  { title: "Tin nhắn hỗ trợ", icon: MessageSquare, href: "/support", badge: 8 },
  { title: "Khuyến mãi", icon: Tag, href: "/promotions" },
  { title: "Báo cáo", icon: FileText, href: "/reports" },
  { title: "Cài đặt", icon: Settings, href: "/settings" },
]

export function AdminSidebar() {
  const { pathname } = useLocation()

  const renderMenu = (items: any[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <NavLink to={item.href}>
          <SidebarMenuButton
            isActive={pathname === item.href}
            tooltip={item.title}
          >
            <item.icon className="size-4" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </NavLink>

        {item.badge && (
          <SidebarMenuBadge className="bg-primary/20 text-primary">
            {item.badge}
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>
    ))

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <Store className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ShopHub</span>
            <span className="text-xs text-muted-foreground">
              Admin Panel
            </span>
          </div>
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Menu chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenu(mainNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Nội dung</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenu(contentNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenu(systemNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-muted-foreground">
              admin@markethub.vn
            </span>
          </div>

          <button className="p-2 hover:bg-muted rounded-md">
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}