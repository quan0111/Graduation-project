import { NavLink, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  FileText,
  Grid3x3,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Users,
} from "lucide-react";

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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLogout } from "@/modules/auth/api/logout";
import { useMe } from "@/modules/auth/api/get-auth-me";

const mainNavItems = [
  { title: "Tổng quan", icon: LayoutDashboard, href: "/" },
  { title: "Quản lý shop", icon: Store, href: "/shops" },
  { title: "Duyệt sản phẩm", icon: Package, href: "/products" },
  { title: "Quản lý đơn hàng", icon: ShoppingCart, href: "/orders" },
  { title: "Duyệt hoàn tiền", icon: RotateCcw, href: "/returns" },
  { title: "Inventory ledger", icon: Boxes, href: "/inventory" },
  { title: "Thống kê doanh thu", icon: BarChart3, href: "/analytics" },
  { title: "Phê duyệt người bán", icon: Users, href: "/seller-applications" },
  { title: "Quản lý người dùng", icon: Users, href: "/users" },
];

const contentNavItems = [
  { title: "Danh mục", icon: Grid3x3, href: "/categories" },
  { title: "Đánh giá", icon: Star, href: "/reviews" },
  { title: "Giao dịch", icon: CreditCard, href: "/transactions" },
  { title: "Vi phạm", icon: AlertTriangle, href: "/violations" },
];

const systemNavItems = [
  { title: "Thông báo", icon: Bell, href: "/notifications" },
  { title: "Tin nhắn hỗ trợ", icon: MessageSquare, href: "/support" },
  { title: "Khuyến mãi", icon: Tag, href: "/promotions" },
  { title: "Marketing", icon: Tag, href: "/marketing" },
  { title: "Audit log", icon: FileText, href: "/audit" },
  { title: "Cài đặt", icon: Settings, href: "/settings" },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { data: user } = useMe();
  const { mutate: logout, isPending: isLogoutPending } = useLogout();

  const renderMenu = (items: Array<{ title: string; icon: any; href: string; badge?: number }>) =>
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

        {item.badge ? (
          <SidebarMenuBadge className="bg-primary/20 text-primary">
            {item.badge}
          </SidebarMenuBadge>
        ) : null}
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <Store className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ShopHub</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
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
          <NavLink to="/profile" className="flex flex-1 items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-muted">
            <Avatar className="size-9">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>
                {(user?.fullName || user?.email || "AD")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{user?.fullName || "Admin"}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email || "admin@markethub.vn"}
              </span>
            </div>
          </NavLink>

          <button
            type="button"
            className="rounded-md p-2 hover:bg-muted disabled:opacity-60"
            disabled={isLogoutPending}
            onClick={() => logout(undefined)}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
