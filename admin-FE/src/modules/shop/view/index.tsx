'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/common/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShopFilter } from '../component/filter-search-shop';
import { ShopBadge } from '../component/shop-badge';
import { useGetAllShop } from '../api/shop/get-all-shop';
import { useUpdateShop } from '../api/shop/update-shop';

export const shopColumns = (
  onView: (shop: any) => void,
  onToggleActive: (shop: any) => void,
) => [
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
    label: "Phân loại",
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
    render: (shop: any) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="w-9 h-9 p-0"
          onClick={(event) => {
            event.stopPropagation();
            onView(shop);
          }}
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="w-9 h-9 p-0"
          onClick={(event) => {
            event.stopPropagation();
            onToggleActive(shop);
          }}
          title={shop.isActive ? "Tạm khóa shop" : "Mở khóa shop"}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];

export default function ShopsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedShop, setSelectedShop] = useState<any>(null);

  // 👇 CALL API
  const { data: shops = [], isLoading, isError } = useGetAllShop();
  const updateShopMutation = useUpdateShop();

  // 👇 MAP DATA (vì backend bạn không có đủ field như mock)
  const mappedShops = shops.map((s: any) => ({
    id: s.id,
    name: s.name,
    owner: s.owner?.fullName || "N/A",
    email: s.owner?.email || "",
    status: s.isActive === false ? "suspended" : "active",
    isActive: s.isActive !== false,
    products: s.productCount || 0,
    revenue: s.revenue || 0,
    rating: s.rating || 0,
    category: s.isActive === false ? "Tạm khóa" : "Đang hoạt động",
    description: s.description || "",
    avatarUrl: s.avatarUrl || "",
  }));

  const handleToggleActive = async (shop: any) => {
    try {
      await updateShopMutation.mutateAsync({
        id: shop.id,
        data: { isActive: !shop.isActive },
      });
      toast.success(shop.isActive ? "Đã tạm khóa shop" : "Đã mở khóa shop");
      if (selectedShop?.id === shop.id) {
        setSelectedShop({ ...shop, isActive: !shop.isActive, status: shop.isActive ? "suspended" : "active" });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể cập nhật shop");
    }
  };

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
            columns={shopColumns(setSelectedShop, handleToggleActive)}
            data={filteredShops}
            title="Danh sách gian hàng"
          />

          <Dialog open={Boolean(selectedShop)} onOpenChange={(open) => !open && setSelectedShop(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Chi tiết shop</DialogTitle>
              </DialogHeader>
              {selectedShop && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedShop.avatarUrl || "/default-avatar.png"}
                      alt={selectedShop.name}
                      className="size-14 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{selectedShop.name}</p>
                      <p className="text-muted-foreground">{selectedShop.email || "Chưa có email"}</p>
                    </div>
                  </div>
                  <p><span className="font-medium">Chủ shop:</span> {selectedShop.owner}</p>
                  <p><span className="font-medium">Sản phẩm:</span> {selectedShop.products}</p>
                  <p><span className="font-medium">Trạng thái:</span> {selectedShop.isActive ? "Hoạt động" : "Tạm khóa"}</p>
                  <p><span className="font-medium">Mô tả:</span> {selectedShop.description || "Chưa có mô tả"}</p>
                  <Button
                    className="w-full"
                    variant={selectedShop.isActive ? "destructive" : "default"}
                    onClick={() => handleToggleActive(selectedShop)}
                    disabled={updateShopMutation.isPending}
                  >
                    {selectedShop.isActive ? "Tạm khóa shop" : "Mở khóa shop"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
