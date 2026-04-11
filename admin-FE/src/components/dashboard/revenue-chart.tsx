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

const data = [
  { month: "T1", revenue: 4500, orders: 2400 },
  { month: "T2", revenue: 5200, orders: 2800 },
  { month: "T3", revenue: 4800, orders: 2600 },
  { month: "T4", revenue: 6100, orders: 3200 },
  { month: "T5", revenue: 5800, orders: 3100 },
  { month: "T6", revenue: 7200, orders: 3800 },
  { month: "T7", revenue: 6900, orders: 3600 },
  { month: "T8", revenue: 8100, orders: 4200 },
  { month: "T9", revenue: 7800, orders: 4000 },
  { month: "T10", revenue: 9200, orders: 4800 },
  { month: "T11", revenue: 8800, orders: 4600 },
  { month: "T12", revenue: 10500, orders: 5200 },
]

export function RevenueChart() {
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
            <AreaChart data={data}>
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
