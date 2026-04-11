'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreVertical, Eye, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const SHOPS = [
  {
    id: 1,
    name: 'Fashion Store Vietnam',
    owner: 'Nguyễn Văn A',
    email: 'shop@fashion.vn',
    status: 'active',
    products: 245,
    revenue: 125000000,
    rating: 4.8,
    joinDate: '2024-01-15',
    category: 'Thời trang'
  },
  {
    id: 2,
    name: 'Electronics Plus',
    owner: 'Trần Thị B',
    email: 'contact@electronics.vn',
    status: 'active',
    products: 380,
    revenue: 89000000,
    rating: 4.6,
    joinDate: '2023-11-20',
    category: 'Điện tử'
  },
  {
    id: 3,
    name: 'Home & Living',
    owner: 'Lê Văn C',
    email: 'info@homeandliving.vn',
    status: 'pending',
    products: 156,
    revenue: 45000000,
    rating: 4.5,
    joinDate: '2024-03-01',
    category: 'Nhà & Cuộc sống'
  },
  {
    id: 4,
    name: 'Beauty World',
    owner: 'Phạm Thị D',
    email: 'beauty@world.vn',
    status: 'active',
    products: 312,
    revenue: 156000000,
    rating: 4.9,
    joinDate: '2024-02-10',
    category: 'Sắc đẹp'
  },
  {
    id: 5,
    name: 'Sports Gear',
    owner: 'Hoàng Văn E',
    email: 'sports@gear.vn',
    status: 'suspended',
    products: 189,
    revenue: 67000000,
    rating: 3.8,
    joinDate: '2023-09-05',
    category: 'Thể thao'
  }
];

export default function ShopsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredShops = SHOPS.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          shop.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shop.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Hoạt động</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Chờ duyệt</Badge>;
      case 'suspended':
        return <Badge className="bg-destructive text-destructive-foreground">Tạm khóa</Badge>;
      default:
        return <Badge>Chưa xác định</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Shop</h1>
            <p className="text-muted-foreground">Quản lý toàn bộ các shop trên nền tảng</p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Tìm kiếm shop, chủ shop..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              Tất cả ({SHOPS.length})
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('active')}
            >
              Hoạt động ({SHOPS.filter(s => s.status === 'active').length})
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending')}
            >
              Chờ duyệt ({SHOPS.filter(s => s.status === 'pending').length})
            </Button>
            <Button
              variant={filterStatus === 'suspended' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('suspended')}
            >
              Tạm khóa ({SHOPS.filter(s => s.status === 'suspended').length})
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách Shop</CardTitle>
              <CardDescription>Tổng cộng {filteredShops.length} shop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Tên Shop</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Chủ Shop</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Danh mục</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Sản phẩm</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Doanh thu</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Đánh giá</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShops.map((shop) => (
                      <tr key={shop.id} className="border-b border-border hover:bg-card/50 transition">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{shop.name}</p>
                            <p className="text-xs text-muted-foreground">{shop.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-foreground">{shop.owner}</td>
                        <td className="py-4 px-4 text-foreground">{shop.category}</td>
                        <td className="py-4 px-4 text-foreground">{shop.products}</td>
                        <td className="py-4 px-4 text-foreground">{(shop.revenue / 1000000).toFixed(1)}M</td>
                        <td className="py-4 px-4">
                          <span className="text-primary font-semibold">⭐ {shop.rating}</span>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(shop.status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
