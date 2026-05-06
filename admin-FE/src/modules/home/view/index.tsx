"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PendingShops } from "@/components/dashboard/pending-shops";
import { PendingProducts } from "@/components/dashboard/pending-products";
import { TopShops } from "@/components/dashboard/top-shops";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CategoryStats } from "@/components/dashboard/category-stats";

import { useDashboard } from "../api/dashboard";
export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (isError || !data) {
    return <div className="p-6 text-red-500">Error loading dashboard</div>;
  }

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">
          Chào mừng trở lại! Đây là tổng quan hoạt động của hệ thống.
        </p>
      </div>

      {/* 🔥 truyền data vào */}
      <StatsCards stats={data} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <CategoryStats />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PendingShops />
        <PendingProducts />
      </div>

      <div className="mt-6">
        <TopShops />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <QuickActions />
      </div>
    </main>
  );
}