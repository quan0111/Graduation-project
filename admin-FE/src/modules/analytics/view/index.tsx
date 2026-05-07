'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line,  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const REVENUE_DATA = [
  { month: 'Tháng 1', revenue: 45000000, orders: 1200, users: 340 },
  { month: 'Tháng 2', revenue: 52000000, orders: 1400, users: 420 },
  { month: 'Tháng 3', revenue: 48000000, orders: 1300, users: 380 },
  { month: 'Tháng 4', revenue: 61000000, orders: 1600, users: 520 },
  { month: 'Tháng 5', revenue: 55000000, orders: 1500, users: 480 },
  { month: 'Tháng 6', revenue: 72000000, orders: 1900, users: 650 },
];

const CATEGORY_DATA = [
  { name: 'Thời trang', value: 35, revenue: 126000000 },
  { name: 'Điện tử', value: 28, revenue: 89000000 },
  { name: 'Sắc đẹp', value: 20, revenue: 156000000 },
  { name: 'Nhà & Cuộc sống', value: 12, revenue: 45000000 },
  { name: 'Khác', value: 5, revenue: 18000000 },
];

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

const TOP_SHOPS = [
  { name: 'Beauty World', revenue: 156000000, growth: 12 },
  { name: 'Fashion Store Vietnam', revenue: 125000000, growth: 8 },
  { name: 'Electronics Plus', revenue: 89000000, growth: 5 },
  { name: 'Home & Living', revenue: 45000000, growth: 15 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6months');

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Thống kê & Doanh thu</h1>
              <p className="text-muted-foreground">Phân tích chi tiết doanh thu và hiệu suất</p>
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

          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">333M</p>
                <p className="text-xs text-success mt-1">+12% so với tháng trước</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">8,100</p>
                <p className="text-xs text-success mt-1">+8% so với tháng trước</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trung bình đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">410K</p>
                <p className="text-xs text-success mt-1">+2% so với tháng trước</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tỷ suất hoàn vốn</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">28%</p>
                <p className="text-xs text-warning mt-1">-1% so với tháng trước</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Doanh thu theo tháng</CardTitle>
                <CardDescription>Xu hướng doanh thu và số lượng đơn hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={REVENUE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      name="Doanh thu (VND)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--chart-2)"
                      name="Số đơn hàng"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Shop</CardTitle>
                <CardDescription>Shop có doanh thu cao nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {TOP_SHOPS.map((shop, idx) => (
                    <div key={idx} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{(shop.revenue / 1000000).toFixed(0)}M</p>
                      </div>
                      <span className={`text-xs font-semibold ${shop.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                        {shop.growth > 0 ? '+' : ''}{shop.growth}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo danh mục</CardTitle>
                <CardDescription>Phân bổ doanh thu theo danh mục sản phẩm</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {CATEGORY_DATA.map((category, index) => (
                        <Cell key={category.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo danh mục (bảng)</CardTitle>
                <CardDescription>Chi tiết doanh thu từng danh mục</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {CATEGORY_DATA.map((category, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm text-foreground">{category.name}</span>
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {(category.revenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
