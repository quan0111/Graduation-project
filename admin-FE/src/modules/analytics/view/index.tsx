'use client';

import { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_URL_ANALYTICS, API_URL_FINANCE } from '@/constant/config';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/date';
import { useDashboard } from '@/modules/home/api/dashboard';
import { useGetAllOrders } from '@/modules/orders/api/get-all-orders';
import { useProducts } from '@/modules/products/api/get-all-product';
import { useGetAllShop } from '@/modules/shop/api/shop/get-all-shop';
import { RecommendationOpsCard } from '@/modules/analytics/components/recommendation-ops-card';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const periodLabels: Record<string, number> = {
  '7days': 7,
  '30days': 30,
  '3months': 90,
  '6months': 180,
  '1year': 365,
};

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const compactNumber = (value: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);

const getTopProducts = async (): Promise<{ ranking: any[]; products: any[] }> => {
  const response = await apiClient.get(`${API_URL_ANALYTICS}/top-products?limit=6`);
  return response.data;
};

const getShopRevenue = async (shopId: number): Promise<{ revenue: number; commission: number; net: number }> => {
  const response = await apiClient.get(`${API_URL_FINANCE}/shop/${shopId}/revenue`);
  return response.data;
};

const getOrderDate = (order: any) => {
  const value = order.createdAt || order.created_at;
  return value ? new Date(value) : null;
};

const getOrderTotal = (order: any) => Number(order.totalAmount ?? order.total_amount ?? 0);

const getOrderItems = (order: any) => order.items || order.Items || [];

const getOrderStatus = (order: any) => String(order.status || '').toUpperCase();

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAYMENT_FAILED: 'Thanh toán lỗi',
  PAYMENT_EXPIRED: 'Thanh toán hết hạn',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  READY_TO_SHIP: 'Chờ giao hàng',
  SHIPPED: 'Đang giao',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  RETURN_REQUESTED: 'Yêu cầu trả hàng',
  RETURNED: 'Đã trả hàng',
};

const isRevenueOrder = (order: any) =>
  ['DELIVERED', 'COMPLETED'].includes(getOrderStatus(order));

const getStatusLabel = (status: string) => statusLabels[status] || status || 'Không rõ';

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

const buildRevenueData = (orders: any[], period: string) => {
  const days = periodLabels[period] ?? 180;
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  const useDailyBuckets = days <= 30;
  const buckets = new Map<string, { label: string; revenue: number; orders: number; users: Set<number> }>();

  if (useDailyBuckets) {
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - index);
      const key = formatDateKey(date);
      buckets.set(key, { label: formatDate(date).slice(0, 5), revenue: 0, orders: 0, users: new Set() });
    }
  } else {
    const monthCount = period === '3months' ? 3 : period === '1year' ? 12 : 6;
    for (let index = monthCount - 1; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, { label: `Tháng ${date.getMonth() + 1}`, revenue: 0, orders: 0, users: new Set() });
    }
  }

  orders.forEach((order) => {
    if (!isRevenueOrder(order)) return;
    const date = getOrderDate(order);
    if (!date || date < start) return;
    const key = useDailyBuckets
      ? formatDateKey(date)
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (!bucket) return;

    bucket.revenue += getOrderTotal(order);
    bucket.orders += 1;
    const userId = Number(order.userId || order.user_id || order.user?.id || order.User?.id || 0);
    if (userId) bucket.users.add(userId);
  });

  return Array.from(buckets.values()).map((bucket) => ({
    label: bucket.label,
    revenue: bucket.revenue,
    orders: bucket.orders,
    users: bucket.users.size,
  }));
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6months');
  const { data: dashboard } = useDashboard();
  const { data: orderPage } = useGetAllOrders({ limit: 100 });
  const orders = orderPage?.data || [];
  const { data: shops = [] } = useGetAllShop();
  const { data: products = [] } = useProducts();
  const { data: topProductsData, isLoading: topProductsLoading } = useQuery({
    queryKey: ['analytics', 'top-products'],
    queryFn: getTopProducts,
  });

  const shopRevenueQueries = useQueries({
    queries: shops.slice(0, 20).map((shop: any) => ({
      queryKey: ['finance', 'shop-revenue', shop.id],
      queryFn: () => getShopRevenue(shop.id),
      enabled: Boolean(shop.id),
    })),
  });

  const revenueData = useMemo(() => buildRevenueData(orders, period), [orders, period]);

  const productById = useMemo(() => new Map(products.map((product: any) => [product.id, product])), [products]);

  const categoryData = useMemo(() => {
    const revenueByCategory = new Map<string, number>();

    orders.filter(isRevenueOrder).forEach((order: any) => {
      getOrderItems(order).forEach((item: any) => {
        const product = productById.get(item.productId || item.product_id);
        const categoryName = product?.category?.name || 'Khác';
        const amount = Number(item.price || 0) * Number(item.quantity || 0);
        revenueByCategory.set(categoryName, (revenueByCategory.get(categoryName) || 0) + amount);
      });
    });

    const total = Array.from(revenueByCategory.values()).reduce((sum, value) => sum + value, 0);
    return Array.from(revenueByCategory.entries())
      .map(([name, revenue]) => ({
        name,
        revenue,
        value: total > 0 ? Math.round((revenue / total) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders, productById]);

  const topShops = useMemo(() => {
    return shops
      .slice(0, 20)
      .map((shop: any, index: number) => ({
        id: shop.id,
        name: shop.name,
        owner: shop.owner?.fullName,
        revenue: Number(shopRevenueQueries[index]?.data?.revenue || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [shopRevenueQueries, shops]);

  const topProducts = topProductsData?.products || [];
  const topProductRank = useMemo(() => {
    const ranking = topProductsData?.ranking || [];
    return new Map(ranking.map((item: any, index: number) => [item.productId, { rank: index + 1, count: item._count?.productId ?? 0 }]));
  }, [topProductsData]);
  const orderStatusData = useMemo(() => {
    const statusCount = new Map<string, number>();
    orders.forEach((order: any) => {
      const status = getOrderStatus(order);
      statusCount.set(status, (statusCount.get(status) || 0) + 1);
    });

    return Array.from(statusCount.entries())
      .map(([status, count]) => ({ status, label: getStatusLabel(status), count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const totalRevenue = Number(dashboard?.totalRevenue || 0);
  const totalOrders = Number(dashboard?.totalOrders || 0);
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = orders.filter(isRevenueOrder).length;
  const completionRate = orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0;
  const nonRevenueOrders = Math.max(orders.length - completedOrders, 0);
  const hasOrdersWithoutRevenue = totalOrders > 0 && totalRevenue === 0 && completedOrders === 0;

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Thống kê & Doanh thu</h1>
              <p className="text-muted-foreground">Dữ liệu lấy trực tiếp từ dashboard, order, finance và analytics API</p>
            </div>
            <Select value={period} onValueChange={(value) => setPeriod(value ?? '6months')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="30days">30 ngày qua</SelectItem>
                <SelectItem value="3months">3 tháng qua</SelectItem>
                <SelectItem value="6months">6 tháng qua</SelectItem>
                <SelectItem value="1year">1 năm qua</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <RecommendationOpsCard />

          {hasOrdersWithoutRevenue && (
            <Card className="mb-6 border-amber-200 bg-amber-50 text-amber-950">
              <CardContent className="p-4">
                <p className="font-semibold">Có dữ liệu đơn hàng thật, nhưng chưa phát sinh doanh thu được ghi nhận.</p>
                <p className="mt-1 text-sm">
                  Dashboard đang có {totalOrders.toLocaleString('vi-VN')} đơn. Doanh thu, biểu đồ doanh thu và top shop chỉ tính đơn
                  ở trạng thái DELIVERED/COMPLETED, hiện chưa có đơn nào đạt trạng thái này nên số tiền đang là 0.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="mb-8 grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{compactNumber(totalRevenue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{currency.format(totalRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{totalOrders.toLocaleString('vi-VN')}</p>
                <p className="mt-1 text-xs text-muted-foreground">Theo API dashboard</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trung bình đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{compactNumber(averageOrder)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{currency.format(averageOrder)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tỷ lệ hoàn tất</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Đơn đã giao / hoàn tất</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Trạng thái đơn hàng</CardTitle>
                <CardDescription>Dữ liệu lấy từ order API, giúp kiểm tra vì sao doanh thu đang bằng 0</CardDescription>
              </CardHeader>
              <CardContent>
                {orderStatusData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có dữ liệu đơn hàng</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {orderStatusData.map((item) => (
                      <div key={item.status} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.status}</p>
                        </div>
                        <span className="text-lg font-semibold text-foreground">{item.count.toLocaleString('vi-VN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nguồn dữ liệu</CardTitle>
                <CardDescription>Các khối trên trang đang gọi API thật</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Dashboard API</span>
                  <span className="font-medium">{totalOrders.toLocaleString('vi-VN')} đơn</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Order API</span>
                  <span className="font-medium">{orders.length.toLocaleString('vi-VN')} đơn tải lên UI</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Đơn tính doanh thu</span>
                  <span className="font-medium">{completedOrders.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Đơn chưa tính doanh thu</span>
                  <span className="font-medium">{nonRevenueOrders.toLocaleString('vi-VN')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Doanh thu theo thời gian</CardTitle>
                <CardDescription>Xu hướng doanh thu, đơn hàng và người mua trong kỳ đã chọn</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip
                      formatter={(value: any, name) => (name === 'revenue' ? currency.format(Number(value)) : value)}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" name="Doanh thu" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="var(--chart-2)" name="Đơn hàng" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shop dẫn đầu</CardTitle>
                <CardDescription>Doanh thu lấy từ finance API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topShops.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu shop</p>
                  ) : (
                    topShops.map((shop) => (
                      <div key={shop.id} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{shop.name}</p>
                          <p className="text-xs text-muted-foreground">{shop.owner || 'Chưa có chủ shop'}</p>
                        </div>
                        <span className="text-xs font-semibold text-foreground">{compactNumber(shop.revenue)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo danh mục</CardTitle>
                <CardDescription>Tổng hợp từ order items và product category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="flex h-75 items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu danh mục</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((category, index) => (
                          <Cell key={category.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bảng danh mục</CardTitle>
                <CardDescription>Doanh thu thực tế theo danh mục</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
                  ) : (
                    categoryData.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="h-3 w-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="truncate text-sm text-foreground">{category.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{compactNumber(category.revenue)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top sản phẩm</CardTitle>
                <CardDescription>Ranking từ /analytics/top-products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProductsLoading ? (
                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                  ) : topProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu sản phẩm</p>
                  ) : (
                    topProducts.map((product: any, index: number) => {
                      const rankInfo = topProductRank.get(product.id) || { rank: index + 1, count: 0 };
                      return (
                      <div key={product.id} className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.png'}
                          alt={product.name}
                          className="size-10 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category?.name || product.shop?.name || 'MarketHub'}</p>
                        </div>
                        <span className="text-xs font-semibold text-foreground">#{rankInfo.rank} · {compactNumber(Number(rankInfo.count))}</span>
                      </div>
                    )})
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
