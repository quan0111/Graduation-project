'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {  MoreVertical, Eye } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import { ShopFilter } from '../component/filter-search-shop';
import { ShopBadge } from '../component/shop-badge';

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
export const shopColumns = [
  {
    key: "name",
    label: "Tên Shop",
    sortable: true,
    filterable: true,
    render: (s: any) => (
      <div>
        <p className="font-medium text-foreground">{s.name}</p>
        <p className="text-xs text-muted-foreground">{s.email}</p>
      </div>
    ),
  },
  {
    key: "owner",
    label: "Chủ Shop",
    sortable: true,
    filterable: true,
  },
  {
    key: "category",
    label: "Danh mục",
    filterable: true,
  },
  {
    key: "products",
    label: "Sản phẩm",
    sortable: true,
  },
  {
    key: "revenue",
    label: "Doanh thu",
    sortable: true,
    render: (s: any) => `${(s.revenue / 1000000).toFixed(1)}M`,
  },
  {
    key: "rating",
    label: "Đánh giá",
    sortable: true,
    render: (s: any) => (
      <span className="text-primary font-semibold">⭐ {s.rating}</span>
    ),
  },
  {
    key: "status",
    label: "Trạng thái",
    filterable: true,
    render: (s: any) => {
      return <ShopBadge status={s.status} />;
      }
    },
  {
    key: "actions",
    label: "Thao tác",
    render: () => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
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



  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Shop</h1>
            <p className="text-muted-foreground">Quản lý toàn bộ các shop trên nền tảng</p>
          </div>
          <ShopFilter
            search={searchTerm}
            onSearchChange={setSearchTerm}
            value={filterStatus}
            onChange={setFilterStatus}
            data={SHOPS}
          />
          <DataTable
            columns={shopColumns}
            data={filteredShops}
            title="Danh sách gian hàng"
          >
          </DataTable>
        </div>
      </main>
    </div>
  );
}
