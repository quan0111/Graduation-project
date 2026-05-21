"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const colors = [
  "oklch(0.72 0.19 160)",
  "oklch(0.65 0.2 250)",
  "oklch(0.75 0.15 70)",
  "oklch(0.68 0.18 290)",
  "oklch(0.5 0 0)",
]

export function CategoryStats({ data }: { data: Array<{ name: string; value: number; percent?: number }> }) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Phân bổ danh mục</CardTitle>
        <CardDescription className="text-muted-foreground">
          Tỷ lệ sản phẩm theo danh mục
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.01 260)",
                    border: "1px solid oklch(0.25 0.01 260)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value) => [`${value}`, "Sản phẩm"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {chartData.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-foreground">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {category.percent ?? category.value}%
                </span>
              </div>
            ))}
            {!chartData.length && (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu danh mục.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
