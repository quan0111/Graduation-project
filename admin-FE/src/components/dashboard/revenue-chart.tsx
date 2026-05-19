"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RevenueChart({ data }: { data: Array<{ month: string; revenue: number; orders: number }> }) {
  const chartData = data.map((item) => ({
    ...item,
    revenue: Math.round((item.revenue || 0) / 1000000),
  }))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Biểu đồ doanh thu</CardTitle>
        <CardDescription className="text-muted-foreground">
          Doanh thu và đơn hàng theo tháng (triệu VNĐ)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
              <XAxis
                dataKey="month"
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.15 0.01 260)",
                  border: "1px solid oklch(0.25 0.01 260)",
                  borderRadius: "8px",
                  color: "oklch(0.98 0 0)",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.72 0.19 160)"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
                name="Doanh thu"
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="oklch(0.65 0.2 250)"
                fillOpacity={1}
                fill="url(#colorOrders)"
                strokeWidth={2}
                name="Đơn hàng"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
