import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, MoreVertical, Search } from 'lucide-react';

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
import { API_URL_ORDER } from '@/constant/config';
import { apiClient } from '@/lib/api';

type Payment = {
  id: number;
  orderId: number;
  amount?: number | null;
  method: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  transactionId?: string | null;
  providerOrderId?: string | null;
  createdAt: string;
  paidAt?: string | null;
};

const formatCurrency = (amount?: number | null) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa có';

const statusMeta: Record<string, { label: string; className: string }> = {
  SUCCESS: { label: 'Thành công', className: 'border-success/20 bg-success/10 text-success' },
  PENDING: { label: 'Chờ xử lý', className: 'border-warning/20 bg-warning/10 text-warning' },
  FAILED: { label: 'Thất bại', className: 'border-destructive/20 bg-destructive/10 text-destructive' },
};

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { data: payments = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => {
      const res = await apiClient.get<Payment[]>(`${API_URL_ORDER}/payment`);
      return res.data;
    },
  });
  const { data: paymentEvents = [] } = useQuery({
    queryKey: ['admin', 'payment-events', selectedPayment?.id],
    enabled: Boolean(selectedPayment),
    queryFn: async () => {
      const res = await apiClient.get(`${API_URL_ORDER}/payment/${selectedPayment?.id}/events`);
      return res.data as Array<any>;
    },
  });

  const filteredTransactions = useMemo(
    () =>
      payments.filter((payment) => {
        const needle = search.toLowerCase();
        return (
          String(payment.id).includes(needle) ||
          String(payment.orderId).includes(needle) ||
          (payment.transactionId || '').toLowerCase().includes(needle) ||
          (payment.providerOrderId || '').toLowerCase().includes(needle)
        );
      }),
    [payments, search],
  );

  const successCount = payments.filter((payment) => payment.status === 'SUCCESS').length;
  const pendingCount = payments.filter((payment) => payment.status === 'PENDING').length;
  const failedCount = payments.filter((payment) => payment.status === 'FAILED').length;

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Quản lý giao dịch</h1>
        <p className="text-muted-foreground">Theo dõi payment thật từ API đơn hàng</p>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Tổng giao dịch</div>
            <div className="mt-2 text-3xl font-bold text-foreground">{payments.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Thành công</div>
            <div className="mt-2 text-3xl font-bold text-success">{successCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Chờ xử lý</div>
            <div className="mt-2 text-3xl font-bold text-warning">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Thất bại</div>
            <div className="mt-2 text-3xl font-bold text-destructive">{failedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Danh sách giao dịch</CardTitle>
              <CardDescription>
                {isLoading ? 'Đang tải dữ liệu...' : `${filteredTransactions.length} giao dịch`}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm giao dịch..."
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
              Không thể tải danh sách giao dịch.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground">Mã giao dịch</TableHead>
                    <TableHead className="text-foreground">Đơn hàng</TableHead>
                    <TableHead className="text-right text-foreground">Số tiền</TableHead>
                    <TableHead className="text-center text-foreground">Phương thức</TableHead>
                    <TableHead className="text-center text-foreground">Nhà cung cấp</TableHead>
                    <TableHead className="text-center text-foreground">Trạng thái</TableHead>
                    <TableHead className="text-center text-foreground">Ngày</TableHead>
                    <TableHead className="text-center text-foreground">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((payment) => {
                    const meta = statusMeta[payment.status] || {
                      label: payment.status,
                      className: 'border-border bg-muted/50 text-muted-foreground',
                    };
                    return (
                      <TableRow key={payment.id} className="border-border hover:bg-sidebar">
                        <TableCell className="font-mono text-foreground">
                          {payment.transactionId || `PAY-${payment.id}`}
                        </TableCell>
                        <TableCell className="text-foreground">#{payment.orderId}</TableCell>
                        <TableCell className="text-right text-foreground">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-center text-foreground">{payment.method}</TableCell>
                        <TableCell className="text-center text-foreground">{payment.providerOrderId || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={meta.className}>
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {formatDate(payment.paidAt || payment.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-border bg-card">
                              <DropdownMenuItem className="cursor-pointer text-foreground" onClick={() => setSelectedPayment(payment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Đối soát payment #{selectedPayment.id}</h2>
                <p className="text-sm text-muted-foreground">
                  Đơn #{selectedPayment.orderId} · {selectedPayment.method} · {selectedPayment.status}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(null)}>
                Đóng
              </Button>
            </div>
            <div className="space-y-3">
              {paymentEvents.length === 0 ? (
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chưa có log callback/retry.</div>
              ) : (
                paymentEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border border-border bg-background p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{event.eventType}</p>
                      <Badge variant="outline">{event.status || '-'}</Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString('vi-VN')} · Retry #{event.retryCount}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Provider: {event.providerOrderId || '-'} · Transaction: {event.transactionId || '-'}
                    </p>
                    {event.message && <p className="mt-2 text-xs text-foreground">{event.message}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
