'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreVertical, Eye,  CheckCircle2, XCircle } from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Áo thun nam cao cấp',
    shop: 'Fashion Store Vietnam',
    category: 'Thời trang',
    status: 'pending',
    price: 299000,
    image: '👔',
    rating: 0,
    sales: 0,
    submitDate: '2024-03-27'
  },
  {
    id: 2,
    name: 'Quần jeans nữ',
    shop: 'Fashion Store Vietnam',
    category: 'Thời trang',
    status: 'approved',
    price: 499000,
    image: '👖',
    rating: 4.7,
    sales: 234,
    submitDate: '2024-03-20'
  },
  {
    id: 3,
    name: 'Laptop Gaming RTX 4080',
    shop: 'Electronics Plus',
    category: 'Điện tử',
    status: 'pending',
    price: 49999000,
    image: '💻',
    rating: 0,
    sales: 0,
    submitDate: '2024-03-26'
  },
  {
    id: 4,
    name: 'Đèn LED thông minh',
    shop: 'Home & Living',
    category: 'Nhà & Cuộc sống',
    status: 'rejected',
    price: 199000,
    image: '💡',
    rating: 0,
    sales: 0,
    submitDate: '2024-03-15'
  },
  {
    id: 5,
    name: 'Serum dưỡng da',
    shop: 'Beauty World',
    category: 'Sắc đẹp',
    status: 'approved',
    price: 899000,
    image: '💄',
    rating: 4.9,
    sales: 567,
    submitDate: '2024-03-10'
  }
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.shop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Duyệt cấp</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Chờ duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Từ chối</Badge>;
      default:
        return <Badge>Chưa xác định</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Sản phẩm</h1>
            <p className="text-muted-foreground">Duyệt và quản lý sản phẩm từ các shop</p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Tìm kiếm sản phẩm, shop..."
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
              Tất cả ({PRODUCTS.length})
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending')}
            >
              Chờ duyệt ({PRODUCTS.filter(p => p.status === 'pending').length})
            </Button>
            <Button
              variant={filterStatus === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('approved')}
            >
              Đã duyệt ({PRODUCTS.filter(p => p.status === 'approved').length})
            </Button>
            <Button
              variant={filterStatus === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('rejected')}
            >
              Từ chối ({PRODUCTS.filter(p => p.status === 'rejected').length})
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách Sản phẩm</CardTitle>
              <CardDescription>Tổng cộng {filteredProducts.length} sản phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-card/50 transition">
                    <div className="text-4xl">{product.image}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.shop}</p>
                        </div>
                        {getStatusBadge(product.status)}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{product.category}</span>
                        <span>Giá: {(product.price / 1000).toFixed(0)}K</span>
                        {product.sales > 0 && <span>Bán: {product.sales}</span>}
                        {product.rating > 0 && <span>⭐ {product.rating}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {product.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90 gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Duyệt
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <XCircle className="w-4 h-4" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
