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

const categories = [
  {
    id: 1,
    name: 'Điện thoại',
    slug: 'dien-thoai',
    products: 1250,
    status: 'Hoạt động',
    commission: '5%',
  },
  {
    id: 2,
    name: 'Laptop & Máy tính',
    slug: 'laptop-may-tinh',
    products: 890,
    status: 'Hoạt động',
    commission: '4%',
  },
  {
    id: 3,
    name: 'Thời trang',
    slug: 'thoi-trang',
    products: 5420,
    status: 'Hoạt động',
    commission: '8%',
  },
  {
    id: 4,
    name: 'Phụ kiện',
    slug: 'phu-kien',
    products: 3100,
    status: 'Hoạt động',
    commission: '10%',
  },
  {
    id: 5,
    name: 'Sách & Văn phòng',
    slug: 'sach-van-phong',
    products: 2340,
    status: 'Tạm ẩn',
    commission: '6%',
  },
];

export default function CategoriesPage() {
  const [search, setSearch] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);

  const handleSearch = (value: string) => {
    setSearch(value);
    const filtered = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(value.toLowerCase()) ||
        cat.slug.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  return (
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Danh mục</h1>
              <p className="text-muted-foreground">Quản lý danh mục sản phẩm trên nền tảng</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Thêm danh mục
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tổng danh mục</div>
                <div className="text-3xl font-bold text-foreground mt-2">125</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Đang hoạt động</div>
                <div className="text-3xl font-bold text-success mt-2">120</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tạm ẩn</div>
                <div className="text-3xl font-bold text-warning mt-2">5</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tổng sản phẩm</div>
                <div className="text-3xl font-bold text-primary mt-2">12,000</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Danh sách danh mục</CardTitle>
                  <CardDescription>Quản lý danh mục sản phẩm</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm danh mục..."
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
                      <TableHead className="text-foreground">Tên danh mục</TableHead>
                      <TableHead className="text-foreground">Slug</TableHead>
                      <TableHead className="text-center text-foreground">Sản phẩm</TableHead>
                      <TableHead className="text-center text-foreground">Hoa hồng</TableHead>
                      <TableHead className="text-center text-foreground">Trạng thái</TableHead>
                      <TableHead className="text-center text-foreground">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((cat) => (
                      <TableRow key={cat.id} className="border-border hover:bg-sidebar">
                        <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                        <TableCell className="text-foreground text-sm">{cat.slug}</TableCell>
                        <TableCell className="text-center text-foreground">{cat.products}</TableCell>
                        <TableCell className="text-center text-foreground">{cat.commission}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              cat.status === 'Hoạt động'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                            }
                          >
                            {cat.status}
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
