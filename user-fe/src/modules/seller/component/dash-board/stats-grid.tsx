import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Boxes,
  Clock3,
  Percent,
  ShoppingBag,
  Store,
  TriangleAlert,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { SellerDashboardOverview } from "../../types/dashboard";
import { formatCompactCurrency } from "../../utils/dashboard";
import { cn } from "@/lib/utils";

interface SellerStat {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  accent: string;
}

interface SellerStatsGridProps {
  overview: SellerDashboardOverview;
}

export function SellerStatsGrid({ overview }: SellerStatsGridProps) {
  const sellerStats: SellerStat[] = [
    {
      label: "Doanh thu gộp",
      value: formatCompactCurrency(overview.grossRevenue),
      helper: "Tổng doanh thu từ đơn có sản phẩm của shop",
      icon: Banknote,
      accent: "bg-orange-100 text-[#ee4d2d]",
    },
    {
      label: "Tổng đơn hàng",
      value: overview.totalOrders.toString(),
      helper: `${overview.pendingOrders} đơn đang cần xử lý`,
      icon: ShoppingBag,
      accent: "bg-blue-100 text-blue-600",
    },
    {
      label: "Sản phẩm đang bán",
      value: overview.activeProducts.toString(),
      helper: `${overview.outOfStockProducts} sản phẩm hết hàng`,
      icon: Boxes,
      accent: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Đơn đang xử lý",
      value: overview.pendingOrders.toString(),
      helper: "Bao gồm chờ xác nhận và đang xử lý",
      icon: Clock3,
      accent: "bg-violet-100 text-violet-600",
    },
    {
      label: "Tỷ lệ hoàn tất",
      value: `${overview.completionRate}%`,
      helper: "Đơn hoàn tất / tổng đơn chưa hủy",
      icon: Percent,
      accent: "bg-amber-100 text-amber-600",
    },
    {
      label: "Tồn kho thấp",
      value: overview.lowStockProducts.toString(),
      helper: "Sản phẩm còn tối đa 10 đơn vị",
      icon: TriangleAlert,
      accent: "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sellerStats.map((stat) => {
        return (
          <Card key={stat.label} className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                </div>
                <div className={cn("rounded-2xl p-3", stat.accent)}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{stat.helper}</p>
                <Store className="size-4 text-slate-300" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
