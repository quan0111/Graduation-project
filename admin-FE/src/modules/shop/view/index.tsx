'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import { ShopFilter } from '../component/filter-search-shop';
import { ShopBadge } from '../component/shop-badge';
import { useGetAllShop } from '../api/shop/get-all-shop';

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
    render: (s: any) => `${((s.revenue || 0) / 1000000).toFixed(1)}M`,
  },
  {
    key: "rating",
    label: "Đánh giá",
    sortable: true,
    render: (s: any) => (
      <span className="text-primary font-semibold">⭐ {s.rating || 0}</span>
    ),
  },
  {
    key: "status",
    label: "Trạng thái",
    filterable: true,
    render: (s: any) => <ShopBadge status={s.status || "active"} />,
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

  // 👇 CALL API
  const { data: shops = [], isLoading, isError } = useGetAllShop();

  // 👇 MAP DATA (vì backend bạn không có đủ field như mock)
  const mappedShops = shops.map((s: any) => ({
    id: s.id,
    name: s.name,
    owner: s.owner?.fullName || "N/A",
    email: s.owner?.email || "",
    status: s.deletedAt ? "suspended" : "active",
    products: s.productCount || 0,
    revenue: s.revenue || 0,
    rating: s.rating || 0,
    category: s.description|| "Chưa phân loại",
  }));

  // 👇 FILTER
  const filteredShops = mappedShops.filter((shop: any) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || shop.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // 👇 loading
  if (isLoading) {
    return <div className="p-6">Đang tải shop...</div>;
  }

  // 👇 error
  if (isError) {
    return <div className="p-6 text-red-500">Lỗi khi tải shop</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Quản lý Shop
            </h1>
            <p className="text-muted-foreground">
              Quản lý toàn bộ các shop trên nền tảng
            </p>
          </div>

          <ShopFilter
            search={searchTerm}
            onSearchChange={setSearchTerm}
            value={filterStatus}
            onChange={setFilterStatus}
            data={mappedShops}
          />

          <DataTable
            columns={shopColumns}
            data={filteredShops}
            title="Danh sách gian hàng"
          />
        </div>
      </main>
    </div>
  );
}