"use client";

import {
  TrendingUp,
  TrendingDown,
  Store,
  Package,
  Users,
  DollarSign,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { IDashboardStats } from "@/modules/home/types";

export function StatsCards({ stats }: { stats: IDashboardStats }) {
  const data = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(stats.totalRevenue),
      change: "+0%", // 👉 sau này tính thật
      trend: "up",
      icon: DollarSign,
      description: "so với tháng trước",
    },
    {
      title: "Shop hoạt động",
      value: stats.totalShops.toLocaleString(),
      change: "+0%",
      trend: "up",
      icon: Store,
      description: "tổng shop",
    },
    {
      title: "Sản phẩm",
      value: stats.totalProducts.toLocaleString(),
      change: "+0%",
      trend: "up",
      icon: Package,
      description: "tổng sản phẩm",
    },
    {
      title: "Người dùng",
      value: stats.totalUsers.toLocaleString(),
      change: "+0%",
      trend: "up",
      icon: Users,
      description: "tổng người dùng",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <stat.icon className="size-5 text-primary" />

              <div className="text-xs text-primary flex items-center gap-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {stat.change}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">
                {stat.title}
              </p>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}