import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { SellerDashboardRecentOrder } from "../../types/dashboard";
import {
  formatCurrency,
  formatShortDateTime,
  getOrderStatusLabel,
  getOrderStatusTone,
} from "../../utils/dashboard";

interface SellerDashboardRecentOrdersCardProps {
  orders: SellerDashboardRecentOrder[];
}

export function SellerDashboardRecentOrdersCard({
  orders,
}: SellerDashboardRecentOrdersCardProps) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-950">Đơn hàng mới nhất</CardTitle>
        <p className="text-sm text-slate-500">Danh sách đơn có chứa sản phẩm của shop</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">#{order.id}</p>
                <Badge className={cn("bg-transparent", getOrderStatusTone(order.status))}>
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{formatShortDateTime(order.createdAt)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="text-slate-500">{order.itemCount} sản phẩm</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.revenue)}</span>
              <span className="text-slate-500">{order.paymentStatus || "Không có thanh toán"}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
