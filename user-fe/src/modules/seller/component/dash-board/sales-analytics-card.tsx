import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SellerDashboardTrendPoint } from "../../types/dashboard";
import { formatCompactCurrency, formatCurrency } from "../../utils/dashboard";

interface SalesAnalyticsCardProps {
  salesTrend: SellerDashboardTrendPoint[];
}

export function SalesAnalyticsCard({ salesTrend }: SalesAnalyticsCardProps) {
  const revenue7d = salesTrend.reduce((sum, item) => sum + item.revenue, 0);
  const orders7d = salesTrend.reduce((sum, item) => sum + item.orders, 0);
  const averageOrderValue = orders7d > 0 ? revenue7d / orders7d : 0;

  return (
    <Card id="analytics" className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold text-slate-950">Phân tích bán hàng</CardTitle>
          <p className="text-sm text-slate-500">Doanh thu và số đơn trong 7 ngày gần nhất</p>
        </div>
        <Badge variant="outline" className="bg-orange-50 text-[#ee4d2d]">
          {orders7d} đơn / 7 ngày
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <MetricBlock label="Doanh thu 7 ngày" value={formatCompactCurrency(revenue7d)} helper={formatCurrency(revenue7d)} />
          <MetricBlock label="Số đơn 7 ngày" value={orders7d.toString()} helper="Tính theo đơn có sản phẩm của shop" />
          <MetricBlock label="Giá trị trung bình" value={formatCompactCurrency(averageOrderValue)} helper="Doanh thu / đơn hàng" />
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="sellerRevenueGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#ee4d2d" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#ee4d2d" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}tr`} tickLine={false} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area
                dataKey="revenue"
                fill="url(#sellerRevenueGradient)"
                stroke="#ee4d2d"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBlock({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p>
    </div>
  );
}
