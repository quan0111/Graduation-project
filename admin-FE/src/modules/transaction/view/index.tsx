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
import { Search, MoreVertical, Eye, Trash2 } from 'lucide-react';

const transactions = [
  {
    id: 1,
    transactionId: 'TXN-001',
    shop: 'Shop A',
    amount: 50000000,
    method: 'Chuyển khoản',
    type: 'Rút tiền',
    status: 'Thành công',
    date: '2024-03-20',
  },
  {
    id: 2,
    transactionId: 'TXN-002',
    shop: 'Shop B',
    amount: 75000000,
    method: 'Ví điện tử',
    type: 'Rút tiền',
    status: 'Thành công',
    date: '2024-03-19',
  },
  {
    id: 3,
    transactionId: 'TXN-003',
    shop: 'Shop C',
    amount: 35000000,
    method: 'Chuyển khoản',
    type: 'Rút tiền',
    status: 'Chờ xử lý',
    date: '2024-03-18',
  },
  {
    id: 4,
    transactionId: 'TXN-004',
    shop: 'Shop D',
    amount: 120000000,
    method: 'Chuyển khoản',
    type: 'Rút tiền',
    status: 'Thành công',
    date: '2024-03-17',
  },
  {
    id: 5,
    transactionId: 'TXN-005',
    shop: 'Shop E',
    amount: 45000000,
    method: 'Chuyển khoản',
    type: 'Rút tiền',
    status: 'Thất bại',
    date: '2024-03-16',
  },
];

const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  const handleSearch = (value: string) => {
    setSearch(value);
    const filtered = transactions.filter(
      (trans) =>
        trans.transactionId.toLowerCase().includes(value.toLowerCase()) ||
        trans.shop.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  const statusColors: Record<string, string> = {
    'Thành công': 'bg-success/10 text-success border-success/20',
    'Chờ xử lý': 'bg-warning/10 text-warning border-warning/20',
    'Thất bại': 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Giao dịch</h1>
            <p className="text-muted-foreground">Theo dõi các giao dịch thanh toán trên nền tảng</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tổng giao dịch</div>
                <div className="text-3xl font-bold text-foreground mt-2">8,450</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Thành công</div>
                <div className="text-3xl font-bold text-success mt-2">8,200</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Chờ xử lý</div>
                <div className="text-3xl font-bold text-warning mt-2">185</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Thất bại</div>
                <div className="text-3xl font-bold text-destructive mt-2">65</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Danh sách giao dịch</CardTitle>
                  <CardDescription>Theo dõi giao dịch thanh toán</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm giao dịch..."
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
                      <TableHead className="text-foreground">Mã giao dịch</TableHead>
                      <TableHead className="text-foreground">Shop</TableHead>
                      <TableHead className="text-right text-foreground">Số tiền</TableHead>
                      <TableHead className="text-center text-foreground">Phương thức</TableHead>
                      <TableHead className="text-center text-foreground">Loại</TableHead>
                      <TableHead className="text-center text-foreground">Trạng thái</TableHead>
                      <TableHead className="text-center text-foreground">Ngày</TableHead>
                      <TableHead className="text-center text-foreground">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((trans) => (
                      <TableRow key={trans.id} className="border-border hover:bg-sidebar">
                        <TableCell className="font-mono text-foreground">{trans.transactionId}</TableCell>
                        <TableCell className="text-foreground">{trans.shop}</TableCell>
                        <TableCell className="text-right text-foreground">
                          {formatCurrency(trans.amount)}đ
                        </TableCell>
                        <TableCell className="text-center text-foreground">{trans.method}</TableCell>
                        <TableCell className="text-center text-foreground">{trans.type}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={statusColors[trans.status]}>
                            {trans.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{trans.date}</TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger >
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
        </main>

  );
}
