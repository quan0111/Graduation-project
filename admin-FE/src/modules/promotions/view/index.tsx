import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, MoreVertical, Edit, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { API_URL_COUPON } from '@/constant/config';
import { apiClient } from '@/lib/api';

type Coupon = {
  id: number;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  usageLimit?: number | null;
  usedCount: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount);

const formatDiscount = (coupon: Coupon) =>
  coupon.discountType === 'PERCENTAGE'
    ? `${coupon.discountValue}%`
    : `${formatCurrency(coupon.discountValue)}đ`;

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : 'Không giới hạn';

export default function PromotionsPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: coupons = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res = await apiClient.get<Coupon[]>(API_URL_COUPON);
      return res.data;
    },
  });
  const invalidateCoupons = () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
  const createCoupon = useMutation({
    mutationFn: async (payload: Partial<Coupon>) => {
      const res = await apiClient.post(API_URL_COUPON, payload);
      return res.data;
    },
    onSuccess: invalidateCoupons,
  });
  const updateCoupon = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Coupon> }) => {
      const res = await apiClient.patch(`${API_URL_COUPON}/${id}`, payload);
      return res.data;
    },
    onSuccess: invalidateCoupons,
  });
  const toggleCoupon = useMutation({
    mutationFn: async (coupon: Coupon) => {
      const action = coupon.isActive ? 'deactivate' : 'activate';
      const res = await apiClient.patch(`${API_URL_COUPON}/${coupon.id}/${action}`);
      return res.data;
    },
    onSuccess: invalidateCoupons,
  });

  const handleCreate = async () => {
    const code = window.prompt('Nhap ma khuyen mai');
    if (!code?.trim()) return;
    const value = Number(window.prompt('Gia tri giam gia (%)', '10'));
    if (!Number.isFinite(value) || value <= 0) return;
    await createCoupon.mutateAsync({
      code: code.trim().toUpperCase(),
      description: `Voucher ${code.trim().toUpperCase()}`,
      discountType: 'PERCENTAGE',
      discountValue: value,
      isActive: true,
    });
  };

  const handleEdit = async (coupon: Coupon) => {
    const description = window.prompt('Mo ta khuyen mai', coupon.description || '');
    if (description === null) return;
    await updateCoupon.mutateAsync({ id: coupon.id, payload: { description } });
  };

  const filteredPromotions = useMemo(
    () =>
      coupons.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(search.toLowerCase()) ||
          (coupon.description || '').toLowerCase().includes(search.toLowerCase()),
      ),
    [coupons, search],
  );

  const activeCount = coupons.filter((coupon) => coupon.isActive).length;
  const usedCount = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
  const limitCount = coupons.reduce((sum, coupon) => sum + (coupon.usageLimit || 0), 0);

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Quản lý khuyến mãi</h1>
          <p className="text-muted-foreground">Dữ liệu lấy từ API coupons thật</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleCreate}
          disabled={createCoupon.isPending}
        >
          Thêm khuyến mãi
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Tổng khuyến mãi</div>
            <div className="mt-2 text-3xl font-bold text-foreground">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Đang hoạt động</div>
            <div className="mt-2 text-3xl font-bold text-success">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Lượt đã dùng</div>
            <div className="mt-2 text-3xl font-bold text-primary">{usedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Giới hạn dùng</div>
            <div className="mt-2 text-3xl font-bold text-warning">{limitCount || '∞'}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Danh sách khuyến mãi</CardTitle>
              <CardDescription>
                {isLoading ? 'Đang tải dữ liệu...' : `${filteredPromotions.length} mã`}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mã..."
                className="w-64 border-border bg-input pl-8 text-foreground"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
              Không thể tải danh sách khuyến mãi.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground">Mã</TableHead>
                    <TableHead className="text-foreground">Tên khuyến mãi</TableHead>
                    <TableHead className="text-center text-foreground">Loại</TableHead>
                    <TableHead className="text-center text-foreground">Chiết khấu</TableHead>
                    <TableHead className="text-right text-foreground">Đã dùng / giới hạn</TableHead>
                    <TableHead className="text-center text-foreground">Hết hạn</TableHead>
                    <TableHead className="text-center text-foreground">Trạng thái</TableHead>
                    <TableHead className="text-center text-foreground">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((coupon) => (
                    <TableRow key={coupon.id} className="border-border hover:bg-sidebar">
                      <TableCell className="font-mono font-bold text-foreground">{coupon.code}</TableCell>
                      <TableCell className="text-foreground">{coupon.description || `Voucher ${coupon.code}`}</TableCell>
                      <TableCell className="text-center text-foreground">
                        {coupon.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                      </TableCell>
                      <TableCell className="text-center text-foreground">{formatDiscount(coupon)}</TableCell>
                      <TableCell className="text-right text-foreground">
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">{formatDate(coupon.validUntil)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            coupon.isActive
                              ? 'border-success/20 bg-success/10 text-success'
                              : 'border-border bg-muted/50 text-muted-foreground'
                          }
                        >
                          {coupon.isActive ? 'Hoạt động' : 'Tạm tắt'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-border bg-card">
                            <DropdownMenuItem className="cursor-pointer text-foreground" onClick={() => handleEdit(coupon)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => toggleCoupon.mutate(coupon)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Tắt mã
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
