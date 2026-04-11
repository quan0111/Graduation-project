'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
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
import { Search, MoreVertical, Eye, Trash2 } from 'lucide-react';

const orders = [
  {
    id: 'ORD-001',
    orderId: '#12345',
    shop: 'Shop A',
    customer: 'Nguyễn Văn A',
    total: 1250000,
    items: 3,
    status: 'Đã giao',
    date: '2024-03-20',
  },
  {
    id: 'ORD-002',
    orderId: '#12346',
    shop: 'Shop B',
    customer: 'Trần Thị B',
    total: 890000,
    items: 2,
    status: 'Đang giao',
    date: '2024-03-19',
  },
  {
    id: 'ORD-003',
    orderId: '#12347',
    shop: 'Shop C',
    customer: 'Lê Văn C',
    total: 2100000,
    items: 5,
    status: 'Chưa thanh toán',
    date: '2024-03-18',
  },
  {
    id: 'ORD-004',
    orderId: '#12348',
    shop: 'Shop A',
    customer: 'Phạm Văn D',
    total: 560000,
    items: 1,
    status: 'Đã hủy',
    date: '2024-03-17',
  },
  {
    id: 'ORD-005',
    orderId: '#12349',
    shop: 'Shop D',
    customer: 'Hoàng Thị E',
    total: 3200000,
    items: 8,
    status: 'Đã giao',
    date: '2024-03-16',
  },
];

const statusColors: Record<string, string> = {
  'Đã giao': 'bg-success/10 text-success border-success/20',
  'Đang giao': 'bg-primary/10 text-primary border-primary/20',
  'Chưa thanh toán': 'bg-warning/10 text-warning border-warning/20',
  'Đã hủy': 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(orders);

  const handleSearch = (value: string) => {
    setSearch(value);
    const filtered = orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(value.toLowerCase()) ||
        order.customer.toLowerCase().includes(value.toLowerCase()) ||
        order.shop.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Đơn hàng</h1>
            <p className="text-muted-foreground">Theo dõi và quản lý tất cả đơn hàng trên nền tảng</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tổng đơn hàng</div>
                <div className="text-3xl font-bold text-foreground mt-2">2,450</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tổng doanh thu</div>
                <div className="text-3xl font-bold text-success mt-2">8.2B</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Đơn hàng hôm nay</div>
                <div className="text-3xl font-bold text-primary mt-2">127</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Chờ xử lý</div>
                <div className="text-3xl font-bold text-warning mt-2">45</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Danh sách đơn hàng</CardTitle>
                  <CardDescription>Quản lý và theo dõi đơn hàng</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm đơn hàng..."
                      className="pl-8 w-64 bg-input border-border text-foreground"
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-foreground">Mã đơn</TableHead>
                      <TableHead className="text-foreground">Shop</TableHead>
                      <TableHead className="text-foreground">Khách hàng</TableHead>
                      <TableHead className="text-center text-foreground">Số lượng</TableHead>
                      <TableHead className="text-right text-foreground">Tổng tiền</TableHead>
                      <TableHead className="text-center text-foreground">Trạng thái</TableHead>
                      <TableHead className="text-center text-foreground">Ngày</TableHead>
                      <TableHead className="text-center text-foreground">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="border-border hover:bg-sidebar">
                        <TableCell className="font-medium text-foreground">{order.orderId}</TableCell>
                        <TableCell className="text-foreground">{order.shop}</TableCell>
                        <TableCell className="text-foreground">{order.customer}</TableCell>
                        <TableCell className="text-center text-foreground">{order.items}</TableCell>
                        <TableCell className="text-right text-foreground">
                          {formatCurrency(order.total)}đ
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={statusColors[order.status]}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{order.date}</TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem className="text-foreground cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
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
        </div>
      </div>
    </div>
  );
}
