'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreVertical, Eye, Reply, Check } from 'lucide-react';

const TICKETS = [
  {
    id: 'TK-001',
    subject: 'Không thể đăng nhập tài khoản',
    customer: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    category: 'Kỹ thuật',
    status: 'open',
    priority: 'high',
    created: '2024-03-27',
    updated: '2024-03-27'
  },
  {
    id: 'TK-002',
    subject: 'Yêu cầu hoàn tiền đơn hàng',
    customer: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    category: 'Hoàn tiền',
    status: 'in_progress',
    priority: 'high',
    created: '2024-03-26',
    updated: '2024-03-27'
  },
  {
    id: 'TK-003',
    subject: 'Giúp tôi upload sản phẩm',
    customer: 'Lê Văn C',
    email: 'levanc@gmail.com',
    category: 'Hỗ trợ bán hàng',
    status: 'open',
    priority: 'medium',
    created: '2024-03-25',
    updated: '2024-03-27'
  },
  {
    id: 'TK-004',
    subject: 'Báo cáo sản phẩm giả',
    customer: 'Phạm Thị D',
    email: 'phamthid@gmail.com',
    category: 'Báo cáo',
    status: 'closed',
    priority: 'high',
    created: '2024-03-20',
    updated: '2024-03-25'
  },
  {
    id: 'TK-005',
    subject: 'Cách tính phí ship',
    customer: 'Hoàng Văn E',
    email: 'hoangvane@gmail.com',
    category: 'Câu hỏi chung',
    status: 'closed',
    priority: 'low',
    created: '2024-03-15',
    updated: '2024-03-22'
  }
];

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTickets = TICKETS.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-warning text-warning-foreground">Mở</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary text-primary-foreground">Đang xử lý</Badge>;
      case 'closed':
        return <Badge className="bg-success text-success-foreground">Đã đóng</Badge>;
      default:
        return <Badge>Chưa xác định</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-destructive text-destructive-foreground">Cao</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Trung bình</Badge>;
      case 'low':
        return <Badge className="bg-muted text-muted-foreground">Thấp</Badge>;
      default:
        return <Badge>Chưa xác định</Badge>;
    }
  };

  return (
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Hỗ trợ Khách hàng</h1>
            <p className="text-muted-foreground">Quản lý và phản hồi các yêu cầu hỗ trợ từ khách hàng</p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Tìm kiếm theo ID ticket, khách hàng, chủ đề..."
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
              Tất cả ({TICKETS.length})
            </Button>
            <Button
              variant={filterStatus === 'open' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('open')}
            >
              Mở ({TICKETS.filter(t => t.status === 'open').length})
            </Button>
            <Button
              variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('in_progress')}
            >
              Đang xử lý ({TICKETS.filter(t => t.status === 'in_progress').length})
            </Button>
            <Button
              variant={filterStatus === 'closed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('closed')}
            >
              Đã đóng ({TICKETS.filter(t => t.status === 'closed').length})
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách Ticket Hỗ trợ</CardTitle>
              <CardDescription>Tổng cộng {filteredTickets.length} ticket</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Chủ đề</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Khách hàng</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Danh mục</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Ưu tiên</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Ngày tạo</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Cập nhật</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-border hover:bg-card/50 transition">
                        <td className="py-4 px-4 font-mono font-semibold text-primary">{ticket.id}</td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground">{ticket.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-foreground">{ticket.customer}</td>
                        <td className="py-4 px-4 text-foreground text-xs">{ticket.category}</td>
                        <td className="py-4 px-4">{getPriorityBadge(ticket.priority)}</td>
                        <td className="py-4 px-4">{getStatusBadge(ticket.status)}</td>
                        <td className="py-4 px-4 text-foreground text-xs">{ticket.created}</td>
                        <td className="py-4 px-4 text-foreground text-xs">{ticket.updated}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {ticket.status !== 'closed' && (
                              <Button size="sm" variant="ghost" className="w-9 h-9 p-0 text-primary">
                                <Reply className="w-4 h-4" />
                              </Button>
                            )}
                            {ticket.status === 'in_progress' && (
                              <Button size="sm" variant="ghost" className="w-9 h-9 p-0 text-success">
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
  );
}
