'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Search, MoreVertical, Edit, Trash2 } from 'lucide-react';

const promotions = [
  {
    id: 1,
    code: 'SAVE10',
    name: 'Giảm 10%',
    discount: '10%',
    type: 'Phần trăm',
    budget: 500000000,
    used: 125000000,
    status: 'Hoạt động',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
  },
  {
    id: 2,
    code: 'SUMMER50',
    name: 'Giảm 50k mua từ 200k',
    discount: '50,000đ',
    type: 'Cố định',
    budget: 1000000000,
    used: 650000000,
    status: 'Hoạt động',
    startDate: '2024-03-15',
    endDate: '2024-04-15',
  },
  {
    id: 3,
    code: 'FLASH30',
    name: 'Flash Sale 30%',
    discount: '30%',
    type: 'Phần trăm',
    budget: 200000000,
    used: 200000000,
    status: 'Hết hạn',
    startDate: '2024-02-15',
    endDate: '2024-03-15',
  },
  {
    id: 4,
    code: 'LOYALTY20',
    name: 'Khách hàng thân thiết',
    discount: '20%',
    type: 'Phần trăm',
    budget: 300000000,
    used: 85000000,
    status: 'Hoạt động',
    startDate: '2024-03-10',
    endDate: '2024-05-10',
  },
];

const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function PromotionsPage() {
  const [search, setSearch] = useState('');
  const [filteredPromotions, setFilteredPromotions] = useState(promotions);

  const handleSearch = (value: string) => {
    setSearch(value);
    const filtered = promotions.filter(
      (promo) =>
        promo.code.toLowerCase().includes(value.toLowerCase()) ||
        promo.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPromotions(filtered);
  };

  return (
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Khuyến mãi</h1>
              <p className="text-muted-foreground">Tạo và quản lý các chương trình khuyến mãi</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Thêm khuyến mãi
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tổng khuyến mãi</div>
                <div className="text-3xl font-bold text-foreground mt-2">45</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Đang hoạt động</div>
                <div className="text-3xl font-bold text-success mt-2">32</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tổng ngân sách</div>
                <div className="text-3xl font-bold text-primary mt-2">2B</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Đã sử dụng</div>
                <div className="text-3xl font-bold text-warning mt-2">1.06B</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Danh sách khuyến mãi</CardTitle>
                  <CardDescription>Quản lý các chương trình khuyến mãi</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm mã..."
                    className="pl-8 w-64 bg-input border-border text-foreground"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-foreground">Mã</TableHead>
                      <TableHead className="text-foreground">Tên khuyến mãi</TableHead>
                      <TableHead className="text-center text-foreground">Loại</TableHead>
                      <TableHead className="text-center text-foreground">Chiết khấu</TableHead>
                      <TableHead className="text-right text-foreground">Ngân sách</TableHead>
                      <TableHead className="text-center text-foreground">Trạng thái</TableHead>
                      <TableHead className="text-center text-foreground">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.map((promo) => (
                      <TableRow key={promo.id} className="border-border hover:bg-sidebar">
                        <TableCell className="font-mono text-foreground font-bold">{promo.code}</TableCell>
                        <TableCell className="text-foreground">{promo.name}</TableCell>
                        <TableCell className="text-center text-foreground">{promo.type}</TableCell>
                        <TableCell className="text-center text-foreground">{promo.discount}</TableCell>
                        <TableCell className="text-right">
                          <div className="text-foreground">
                            {formatCurrency(promo.used)} / {formatCurrency(promo.budget)}đ
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              promo.status === 'Hoạt động'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-muted/50 text-muted-foreground border-border'
                            }
                          >
                            {promo.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger >
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem className="text-foreground cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive cursor-pointer">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

  );
}
