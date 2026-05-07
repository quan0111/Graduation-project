import { useMemo, useState } from 'react';
import { Check, Eye, MoreVertical, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminReturnRequests, useReviewReturnRequest } from '@/modules/returns/api/returns';

const statusMap: Record<string, { label: string; className: string }> = {
  REQUESTED: { label: 'Mở', className: 'bg-warning text-warning-foreground' },
  APPROVED: { label: 'Đang xử lý', className: 'bg-primary text-primary-foreground' },
  REJECTED: { label: 'Đã đóng', className: 'bg-muted text-muted-foreground' },
  REFUNDED: { label: 'Đã đóng', className: 'bg-success text-success-foreground' },
};

const priorityMap: Record<string, { label: string; className: string }> = {
  high: { label: 'Cao', className: 'bg-destructive text-destructive-foreground' },
  medium: { label: 'Trung bình', className: 'bg-warning text-warning-foreground' },
  low: { label: 'Thấp', className: 'bg-muted text-muted-foreground' },
};

const toTicketStatus = (status: string) => {
  if (status === 'REQUESTED') return 'open';
  if (status === 'APPROVED') return 'in_progress';
  return 'closed';
};

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: returns = [], isLoading, isError, refetch } = useAdminReturnRequests();
  const reviewMutation = useReviewReturnRequest();

  const tickets = useMemo(
    () =>
      returns.map((item) => ({
        id: `RT-${item.id}`,
        returnId: item.id,
        subject: item.reason,
        customer: item.user?.fullName || `User #${item.userId}`,
        email: item.user?.email || '-',
        category: 'Hoàn tiền / trả hàng',
        status: toTicketStatus(item.status),
        rawStatus: item.status,
        priority: item.refundAmount && item.refundAmount > 1_000_000 ? 'high' : 'medium',
        created: item.createdAt,
        updated: item.reviewedAt || item.createdAt,
      })),
    [returns],
  );

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleReview = async (returnId: number, status: 'APPROVED' | 'REJECTED') => {
    const rejectReason =
      status === 'REJECTED' ? window.prompt('Nhập lý do từ chối yêu cầu hỗ trợ') || undefined : undefined;
    if (status === 'REJECTED' && !rejectReason) return;

    await reviewMutation.mutateAsync({
      returnId,
      payload: { status, rejectReason },
    });
    toast.success(status === 'APPROVED' ? 'Đã tiếp nhận yêu cầu' : 'Đã đóng yêu cầu');
    await refetch();
  };

  const getStatusBadge = (status: string) => {
    const meta = statusMap[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    return <Badge className={meta.className}>{meta.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const meta = priorityMap[priority] || priorityMap.low;
    return <Badge className={meta.className}>{meta.label}</Badge>;
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Hỗ trợ khách hàng</h1>
        <p className="text-muted-foreground">Ticket lấy từ yêu cầu trả hàng/hoàn tiền thật</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo ID, khách hàng, chủ đề..."
            className="pl-10"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {[
          ['all', 'Tất cả'],
          ['open', 'Mở'],
          ['in_progress', 'Đang xử lý'],
          ['closed', 'Đã đóng'],
        ].map(([value, label]) => (
          <Button
            key={value}
            variant={filterStatus === value ? 'default' : 'outline'}
            onClick={() => setFilterStatus(value)}
          >
            {label} ({value === 'all' ? tickets.length : tickets.filter((ticket) => ticket.status === value).length})
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ticket hỗ trợ</CardTitle>
          <CardDescription>
            {isLoading ? 'Đang tải dữ liệu...' : `Tổng cộng ${filteredTickets.length} ticket`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
              Không thể tải ticket hỗ trợ.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Chủ đề</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Khách hàng</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Danh mục</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Ưu tiên</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Ngày tạo</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Cập nhật</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border transition hover:bg-card/50">
                      <td className="px-4 py-4 font-mono font-semibold text-primary">{ticket.id}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground">{ticket.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-foreground">{ticket.customer}</td>
                      <td className="px-4 py-4 text-xs text-foreground">{ticket.category}</td>
                      <td className="px-4 py-4">{getPriorityBadge(ticket.priority)}</td>
                      <td className="px-4 py-4">{getStatusBadge(ticket.rawStatus)}</td>
                      <td className="px-4 py-4 text-xs text-foreground">
                        {new Date(ticket.created).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4 text-xs text-foreground">
                        {new Date(ticket.updated).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {ticket.rawStatus === 'REQUESTED' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 text-success"
                                disabled={reviewMutation.isPending}
                                onClick={() => handleReview(ticket.returnId, 'APPROVED')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 text-destructive"
                                disabled={reviewMutation.isPending}
                                onClick={() => handleReview(ticket.returnId, 'REJECTED')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
