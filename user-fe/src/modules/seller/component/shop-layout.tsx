import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BadgeDollarSign,
  BarChart3,
  ClipboardList,
  HelpCircle,
  Home,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Package,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Store,
  TicketPercent,
  Truck,
  UserRound,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/modules/notification/components/notification-bell";
import { useGetShopByOwnerId } from "@/modules/shop/api/myshop";

const menuGroups = [
  {
    label: "Vận hành",
    items: [
      { label: "Tổng quan", href: "/seller/dashboard", icon: LayoutDashboard, match: "/seller/dashboard" },
      { label: "Đơn hàng", href: "/seller/orders", icon: ClipboardList, match: "/seller/orders" },
      { label: "Trả hàng / hoàn tiền", href: "/seller/returns", icon: RefreshCcw, match: "/seller/returns" },
      { label: "Vi phạm sản phẩm", href: "/seller/violations", icon: ShieldCheck, match: "/seller/violations" },
      { label: "Sản phẩm", href: "/seller/products", icon: Package, match: "/seller/products" },
      { label: "Kho & giá variant", href: "/seller/inventory", icon: Package, match: "/seller/inventory" },
      { label: "Vận chuyển", href: "/seller/shipping", icon: Truck, match: "/seller/shipping" },
      { label: "Review khách hàng", href: "/seller/reviews", icon: Star, match: "/seller/reviews" },
    ],
  },
  {
    label: "Tăng trưởng",
    items: [
      { label: "Marketing", href: "/seller/marketing", icon: Megaphone, match: "/seller/marketing" },
      { label: "Khách hàng", href: "/seller/customers", icon: UserRound, match: "/seller/customers" },
      { label: "Coupon shop", href: "/seller/coupons", icon: TicketPercent, match: "/seller/coupons" },
      { label: "Phân tích", href: "/seller/analytics", icon: BarChart3, match: "/seller/analytics" },
      { label: "Tài chính", href: "/seller/finance", icon: BadgeDollarSign, match: "/seller/finance" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { label: "Cài đặt shop", href: "/seller/settings", icon: Settings, match: "/seller/settings" },
      { label: "Trợ giúp", href: "/seller/support", icon: HelpCircle, match: "/seller/support" },
    ],
  },
] as const;

interface SellerDashboardLayoutProps {
  children: ReactNode;
}

export function SellerDashboardLayout({ children }: SellerDashboardLayoutProps) {
  const location = useLocation();
  const { data: shop, isLoading: isShopLoading } = useGetShopByOwnerId({ retry: false });
  const shopName = shop?.name?.trim() || (isShopLoading ? "Đang tải shop..." : "Shop của bạn");
  const publicShopHref = shop?.id ? `/shop/${shop.id}` : "/seller/settings";

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-orange-100 bg-white lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-orange-100 px-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#ee4d2d] text-white shadow-sm">
            <Store className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#ee4d2d]">
              Kênh người bán
            </p>
            <p className="max-w-40 truncate text-xs text-slate-500">{shopName}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-[#ee4d2d]",
                      location.pathname.startsWith(item.match) &&
                        "bg-orange-50 text-[#ee4d2d] shadow-[inset_3px_0_0_#ee4d2d]",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="m-4 rounded-2xl bg-linear-to-br from-orange-50 to-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="size-4 text-[#ee4d2d]" />
            Shop uy tín
          </div>
          <p className="mb-4 text-xs leading-5 text-slate-500">
            Hoàn tất SLA đơn hàng và phản hồi khách để giữ điểm vận hành tốt.
          </p>
          <Button size="sm" className="w-full bg-[#ee4d2d] hover:bg-[#d93f21]">
            Xem tiêu chí
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#ee4d2d] text-white">
                <Store className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-[#ee4d2d]">Kênh người bán</span>
                <p className="max-w-36 truncate text-xs text-slate-500">{shopName}</p>
              </div>
            </div>

            <div className="hidden w-full max-w-xl items-center gap-2 rounded-full border border-orange-100 bg-orange-50/60 px-4 py-2 md:flex">
              <Search className="size-4 text-slate-400" />
              <Input
                aria-label="Tìm kiếm trong seller dashboard"
                className="h-6 border-0 bg-transparent p-0 text-sm shadow-none ring-0 focus-visible:ring-0"
                placeholder="Tìm đơn hàng, sản phẩm, mã vận đơn..."
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link to="/seller/support" className="inline-flex size-9 items-center justify-center rounded-4xl transition hover:bg-slate-100" aria-label="Tin nhắn">
                <MessageCircle className="size-5 text-slate-600" />
              </Link>
              <NotificationBell />
              <Link
                to="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "size-9 rounded-full px-0 md:size-auto md:gap-2 md:px-3",
                )}
                aria-label="Về trang người dùng"
              >
                <Home className="size-4" />
                <span className="hidden md:inline">Trang người dùng</span>
              </Link>
              <Link
                to={publicShopHref}
                className={cn(buttonVariants({ variant: "outline" }), "hidden gap-2 rounded-full md:inline-flex")}
              >
                <Store className="size-4" />
                Xem shop
              </Link>
              <Link
                to="/seller/settings"
                className="flex items-center gap-2 rounded-full border border-orange-100 bg-white px-2 py-1.5 text-sm font-medium text-slate-700"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-orange-100 text-[#ee4d2d]">
                  <UserRound className="size-4" />
                </div>
                <span className="hidden max-w-40 truncate sm:inline">{shopName}</span>
                <Settings className="hidden size-4 text-slate-400 sm:block" />
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
