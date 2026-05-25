import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Eye, MoreVertical, RefreshCw, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { formatDateTime } from "@/lib/date";

type Payment = {
  id: number;
  orderId: number;
  amount?: number | null;
  method: string;
  status: string;
  transactionId?: string | null;
  providerOrderId?: string | null;
  providerMessage?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  paidAt?: string | null;
};

type PaymentHold = Payment & {
  orderStatus: string;
  orderCreatedAt: string;
  userId: number;
  eventCount: number;
  latestEventMessage?: string | null;
};

type FilterKey = "all" | "success" | "hold" | "failed";

const SUCCESS_STATUSES = new Set(["SUCCESS", "PAYMENT_SUCCESS"]);
const FAILED_STATUSES = new Set(["FAILED", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]);
const HOLD_ORDER_STATUSES = new Set(["PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]);

const formatCurrency = (amount?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const normalize = (value?: string | null) => String(value || "").toUpperCase();

const statusMeta: Record<string, { label: string; className: string }> = {
  SUCCESS: { label: "Thành công", className: "border-success/20 bg-success/10 text-success" },
  PAYMENT_SUCCESS: { label: "Thành công", className: "border-success/20 bg-success/10 text-success" },
  PENDING: { label: "Chờ xử lý", className: "border-warning/20 bg-warning/10 text-warning" },
  PENDING_PAYMENT: { label: "Chờ thanh toán", className: "border-warning/20 bg-warning/10 text-warning" },
  FAILED: { label: "Thất bại", className: "border-destructive/20 bg-destructive/10 text-destructive" },
  PAYMENT_FAILED: { label: "Thanh toán lỗi", className: "border-destructive/20 bg-destructive/10 text-destructive" },
  PAYMENT_EXPIRED: { label: "Hết hạn", className: "border-muted bg-muted/70 text-muted-foreground" },
};

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "success", label: "Thành công" },
  { key: "hold", label: "Payment hold" },
  { key: "failed", label: "Lỗi/hết hạn" },
];

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | PaymentHold | null>(null);
  const [cleanupMessage, setCleanupMessage] = useState("");

  const { data: payments = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const res = await apiClient.get<Payment[]>(`${API_URL_ORDER}/payment`);
      return res.data;
    },
  });

  const { data: paymentHolds = [], isLoading: isLoadingHolds } = useQuery({
    queryKey: ["admin", "payment-holds"],
    queryFn: async () => {
      const res = await apiClient.get<PaymentHold[]>(`${API_URL_ORDER}/payment/holds`);
      return res.data;
    },
  });

  const expireMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`${API_URL_ORDER}/payment/holds/expire-stale`);
      return res.data as { expired?: number; skipped?: number };
    },
    onSuccess: async (result) => {
      setCleanupMessage(`Đã dọn ${result.expired || 0} hold quá hạn, bỏ qua ${result.skipped || 0} hold.`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "payment-holds"] });
    },
  });

  const holdsByPaymentId = useMemo(() => new Map(paymentHolds.map((payment) => [payment.id, payment])), [paymentHolds]);

  const filteredTransactions = useMemo(() => {
    const source = activeFilter === "hold" ? paymentHolds : payments;
    const needle = search.trim().toLowerCase();

    return source.filter((payment) => {
      const status = normalize(payment.status);
      const hold = holdsByPaymentId.get(payment.id);
      const orderStatus = normalize(hold?.orderStatus);

      if (activeFilter === "success" && !SUCCESS_STATUSES.has(status)) {
        return false;
      }
      if (activeFilter === "failed" && !FAILED_STATUSES.has(status)) {
        return false;
      }
      if (activeFilter === "hold" && !HOLD_ORDER_STATUSES.has(orderStatus)) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return (
        String(payment.id).includes(needle) ||
        String(payment.orderId).includes(needle) ||
        (payment.transactionId || "").toLowerCase().includes(needle) ||
        (payment.providerOrderId || "").toLowerCase().includes(needle) ||
        (payment.providerMessage || "").toLowerCase().includes(needle) ||
        (hold?.latestEventMessage || "").toLowerCase().includes(needle)
      );
    });
  }, [activeFilter, holdsByPaymentId, paymentHolds, payments, search]);

  const successCount = payments.filter((payment) => SUCCESS_STATUSES.has(normalize(payment.status))).length;
  const failedCount = payments.filter((payment) => FAILED_STATUSES.has(normalize(payment.status))).length;

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Quản lý giao dịch</h1>
          <p className="text-muted-foreground">
            Theo dõi payment, callback gateway và các payment hold đang bị ẩn khỏi hóa đơn.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          disabled={expireMutation.isPending}
          onClick={() => expireMutation.mutate()}
        >
          <RefreshCw className={`h-4 w-4 ${expireMutation.isPending ? "animate-spin" : ""}`} />
          Dọn hold quá hạn
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
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
            <div className="text-sm text-muted-foreground">Payment hold</div>
            <div className="mt-2 text-3xl font-bold text-warning">{paymentHolds.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Lỗi/hết hạn</div>
            <div className="mt-2 text-3xl font-bold text-destructive">{failedCount}</div>
          </CardContent>
        </Card>
      </div>

      {cleanupMessage || expireMutation.isError ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4" />
          {expireMutation.isError ? "Không thể dọn payment hold quá hạn." : cleanupMessage}
        </div>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Danh sách giao dịch</CardTitle>
              <CardDescription>
                {isLoading || isLoadingHolds ? "Đang tải dữ liệu..." : `${filteredTransactions.length} giao dịch`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-full border border-border bg-muted/40 p-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      activeFilter === option.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveFilter(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm giao dịch..."
                  className="w-64 border-border bg-input pl-8 text-foreground"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
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
                    <TableHead className="text-center text-foreground">Provider order</TableHead>
                    <TableHead className="text-center text-foreground">Payment</TableHead>
                    <TableHead className="text-center text-foreground">Order</TableHead>
                    <TableHead className="text-center text-foreground">Ngày</TableHead>
                    <TableHead className="text-center text-foreground">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((payment) => {
                    const paymentStatus = normalize(payment.status);
                    const hold = holdsByPaymentId.get(payment.id);
                    const paymentMeta = statusMeta[paymentStatus] || {
                      label: payment.status,
                      className: "border-border bg-muted/50 text-muted-foreground",
                    };
                    const orderStatus = normalize(hold?.orderStatus);
                    const orderMeta = statusMeta[orderStatus] || {
                      label: hold?.orderStatus || "-",
                      className: "border-border bg-muted/50 text-muted-foreground",
                    };

                    return (
                      <TableRow key={payment.id} className="border-border hover:bg-sidebar">
                        <TableCell className="font-mono text-foreground">
                          {payment.transactionId || `PAY-${payment.id}`}
                        </TableCell>
                        <TableCell className="text-foreground">#{payment.orderId}</TableCell>
                        <TableCell className="text-right text-foreground">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-center text-foreground">{payment.method}</TableCell>
                        <TableCell className="max-w-[180px] truncate text-center text-foreground">
                          {payment.providerOrderId || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={paymentMeta.className}>
                            {paymentMeta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {hold ? (
                            <Badge variant="outline" className={orderMeta.className}>
                              {orderMeta.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {formatDateTime(payment.paidAt || payment.updatedAt || payment.createdAt, "Chưa có")}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-border bg-card">
                              <DropdownMenuItem
                                className="cursor-pointer text-foreground"
                                onClick={() => setSelectedPayment(hold || payment)}
                              >
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
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </main>
  );
}

function PaymentDetailModal({ payment, onClose }: { payment: Payment | PaymentHold; onClose: () => void }) {
  const { data: paymentEvents = [] } = useQuery({
    queryKey: ["admin", "payment-events", payment.id],
    queryFn: async () => {
      const res = await apiClient.get(`${API_URL_ORDER}/payment/${payment.id}/events`);
      return res.data as Array<any>;
    },
  });
  const hold = "orderStatus" in payment ? payment : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Đối soát payment #{payment.id}</h2>
            <p className="text-sm text-muted-foreground">
              Đơn #{payment.orderId} · {payment.method} · {payment.status}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>

        <div className="mb-5 grid gap-3 rounded-xl border border-border bg-background p-4 text-sm md:grid-cols-2">
          <Info label="Provider order" value={payment.providerOrderId || "-"} />
          <Info label="Transaction" value={payment.transactionId || "-"} />
          <Info label="Số tiền" value={formatCurrency(payment.amount)} />
          <Info label="Cập nhật" value={formatDateTime(payment.updatedAt || payment.createdAt)} />
          <Info label="Gateway message" value={payment.providerMessage || "-"} />
          <Info label="Order hold" value={hold ? hold.orderStatus : "Không"} />
          {hold ? <Info label="User" value={`#${hold.userId}`} /> : null}
          {hold ? <Info label="Log gần nhất" value={hold.latestEventMessage || "-"} /> : null}
        </div>

        <div className="space-y-3">
          {paymentEvents.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chưa có log callback/retry.</div>
          ) : (
            paymentEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-border bg-background p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{event.eventType}</p>
                  <Badge variant="outline">{event.status || "-"}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {formatDateTime(event.createdAt)} · Retry #{event.retryCount}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Provider: {event.providerOrderId || "-"} · Transaction: {event.transactionId || "-"}
                </p>
                {event.message && <p className="mt-2 text-xs text-foreground">{event.message}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-medium text-foreground">{value}</p>
    </div>
  );
}
