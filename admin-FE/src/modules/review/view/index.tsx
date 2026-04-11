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
import { Search, MoreVertical, Eye, Trash2, Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    productName: 'iPhone 15 Pro',
    reviewer: 'Nguyễn Văn A',
    rating: 5,
    title: 'Sản phẩm tuyệt vời!',
    content: 'Chất lượng rất tốt, giao hàng nhanh, sẽ mua lại',
    status: 'Đã duyệt',
    date: '2024-03-20',
  },
  {
    id: 2,
    productName: 'MacBook Pro 14',
    reviewer: 'Trần Thị B',
    rating: 4,
    title: 'Rất hài lòng',
    content: 'Máy chạy mượt, pin tốt, giá hơi cao một chút',
    status: 'Đã duyệt',
    date: '2024-03-19',
  },
  {
    id: 3,
    productName: 'Samsung Galaxy S24',
    reviewer: 'Lê Văn C',
    rating: 3,
    title: 'Bình thường',
    content: 'Máy ổn, nhưng camera không như kỳ vọng',
    status: 'Chờ duyệt',
    date: '2024-03-18',
  },
  {
    id: 4,
    productName: 'iPad Air',
    reviewer: 'Phạm Văn D',
    rating: 2,
    title: 'Không hài lòng',
    content: 'Giá cao, hiệu năng không tương xứng',
    status: 'Chờ duyệt',
    date: '2024-03-17',
  },
  {
    id: 5,
    productName: 'AirPods Pro',
    reviewer: 'Hoàng Thị E',
    rating: 5,
    title: 'Tốt lắm!',
    content: 'Âm thanh tuyệt vời, chống ồn hiệu quả',
    status: 'Đã duyệt',
    date: '2024-03-16',
  },
];

export default function ReviewsPage() {
  const [search, setSearch] = useState('');
  const [filteredReviews, setFilteredReviews] = useState(reviews);

  const handleSearch = (value: string) => {
    setSearch(value);
    const filtered = reviews.filter(
      (review) =>
        review.productName.toLowerCase().includes(value.toLowerCase()) ||
        review.reviewer.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'fill-warning text-warning' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Đánh giá</h1>
            <p className="text-muted-foreground">Duyệt và quản lý đánh giá của khách hàng</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tổng đánh giá</div>
                <div className="text-3xl font-bold text-foreground mt-2">12,450</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Chờ duyệt</div>
                <div className="text-3xl font-bold text-warning mt-2">342</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Đã duyệt</div>
                <div className="text-3xl font-bold text-success mt-2">12,108</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Đã từ chối</div>
                <div className="text-3xl font-bold text-destructive mt-2">45</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Danh sách đánh giá</CardTitle>
                  <CardDescription>Duyệt và quản lý đánh giá khách hàng</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm đánh giá..."
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
                      <TableHead className="text-foreground">Sản phẩm</TableHead>
                      <TableHead className="text-foreground">Người đánh giá</TableHead>
                      <TableHead className="text-center text-foreground">Sao</TableHead>
                      <TableHead className="text-foreground">Tiêu đề</TableHead>
                      <TableHead className="text-center text-foreground">Trạng thái</TableHead>
                      <TableHead className="text-center text-foreground">Ngày</TableHead>
                      <TableHead className="text-center text-foreground">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews.map((review) => (
                      <TableRow key={review.id} className="border-border hover:bg-sidebar">
                        <TableCell className="text-foreground">{review.productName}</TableCell>
                        <TableCell className="text-foreground">{review.reviewer}</TableCell>
                        <TableCell className="text-center">{renderStars(review.rating)}</TableCell>
                        <TableCell className="text-foreground text-sm">{review.title}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              review.status === 'Đã duyệt'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                            }
                          >
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{review.date}</TableCell>
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
