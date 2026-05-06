import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useGetSellerDashboard } from "@/modules/seller/api/get-dashboard";
import { DashboardState } from "@/modules/seller/component/dash-board/dashboard-state";
import { SellerDashboardHero } from "@/modules/seller/component/dash-board/dashboard-hero";
import {
  SellerDashboardInventoryCard,
  SellerDashboardTopProductsCard,
} from "@/modules/seller/component/dash-board/top-products-card";
import {
  SellerDashboardOrderOverviewCard,
  SellerDashboardWalletCard,
} from "@/modules/seller/component/dash-board/order-overview-card";
import { SellerDashboardRecentOrdersCard } from "@/modules/seller/component/dash-board/recent-orders-card";
import { SalesAnalyticsCard } from "@/modules/seller/component/dash-board/sales-analytics-card";
import { SellerStatsGrid } from "@/modules/seller/component/dash-board/stats-grid";
import { SellerDashboardTodoPanel } from "@/modules/seller/component/dash-board/todo-panel";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";

export default function SellerDashboardPage() {
  const { data, isLoading, isError } = useGetSellerDashboard();

  return (
    <SellerDashboardLayout>
      {isLoading && <SellerDashboardLoadingState />}
      {isError && !isLoading && (
        <section className="space-y-6">
          <DashboardState
            title="Không tải được seller dashboard"
            description="Yêu cầu dữ liệu tới backend không thành công. Kiểm tra đăng nhập, token hoặc trạng thái API rồi thử lại."
            actionLabel="Về trang chủ"
            actionHref="/"
          />
        </section>
      )}
      {!isLoading && !isError && data?.accessState === "not-seller" && (
        <section className="space-y-6">
          <DashboardState
            title="Tài khoản chưa là seller"
            description="Seller dashboard chỉ dùng cho tài khoản đã được duyệt bán hàng."
            actionLabel="Đăng ký seller"
            actionHref="/seller"
          />
        </section>
      )}
      {!isLoading && !isError && data?.accessState === "no-shop" && (
        <section className="space-y-6">
          <DashboardState
            title="Chưa có shop hoạt động"
            description="Tài khoản seller chưa có dữ liệu shop để tải dashboard. Hoàn tất hồ sơ shop trước khi vào kênh người bán."
            actionLabel="Hoàn tất hồ sơ"
            actionHref="/seller"
          />
        </section>
      )}
      {!isLoading && !isError && data?.accessState === "ready" && data.shop && (
        <section id="overview" className="space-y-6">
          <SellerDashboardHero shop={data.shop} user={data.user} />
          <SellerStatsGrid overview={data.overview} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
            <SalesAnalyticsCard salesTrend={data.salesTrend} />
            <SellerDashboardTodoPanel todo={data.todo} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <SellerDashboardOrderOverviewCard orderFlow={data.orderFlow} />
            <SellerDashboardWalletCard wallet={data.wallet} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
            <SellerDashboardTopProductsCard products={data.topProducts} />
            <SellerDashboardInventoryCard inventory={data.inventory} />
          </div>

          <SellerDashboardRecentOrdersCard orders={data.recentOrders} />
        </section>
      )}
    </SellerDashboardLayout>
  );
}

function SellerDashboardLoadingState() {
  return (
    <section className="space-y-6">
      <div className="h-48 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70" />
        ))}
      </div>
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
        <CardContent className="flex items-center gap-3 p-6 text-sm text-slate-500">
          <AlertCircle className="size-4" />
          Đang tải dữ liệu shop, sản phẩm và đơn hàng...
        </CardContent>
      </Card>
    </section>
  );
}
