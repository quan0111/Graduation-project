import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CheckCircle2, Clock3, Percent, ReceiptText, RefreshCw, Store, WalletCards, XCircle } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/app-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL_FINANCE } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { CommissionConfigCard } from "@/modules/finance/components/commission-config-card";

type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";

type Payout = {
  id: number;
  shopId: number;
  amount: number;
  status: PayoutStatus;
  createdAt: string;
  paidAt?: string | null;
  reviewedAt?: string | null;
  reviewedById?: number | null;
  reviewedBy?: {
    id: number;
    email: string;
    fullName?: string | null;
  } | null;
  note?: string | null;
  shop?: { id: number; name: string };
};

type PayoutAction = {
  id: number;
  status: "PROCESSING" | "PAID" | "FAILED";
  amount: number;
  shopName: string;
};

type FinanceSummary = {
  grossRevenue: number;
  commissionAmount: number;
  sellerNetAmount: number;
  availableBalance: number;
  pendingPayoutAmount: number;
  paidPayoutAmount: number;
  failedPayoutAmount: number;
  pendingPayoutCount: number;
  payoutCount: number;
  commissionCount: number;
  shopsCount: number;
};

type Commission = {
  id: number;
  orderId: number;
  orderItemId?: number | null;
  shopId: number;
  commissionRate: number;
  grossAmount: number;
  commissionAmount: number;
  sellerNetAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shop?: { id: number; name: string } | null;
  order?: { id: number; checkoutGroupCode?: string | null; checkoutGroupPrimary?: boolean } | null;
  orderItem?: { id: number; productName: string; quantity: number; price: number } | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatPercent = (value: number) => `${Math.round((value || 0) * 10000) / 100}%`;

const getStatusClass = (status: string) => {
  if (status === "PAID" || status === "EARNED" || status === "SETTLED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "PENDING" || status === "PROCESSING") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "FAILED" || status === "CANCELLED" || status === "REFUNDED") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

export default function AdminFinancePage() {
  const queryClient = useQueryClient();
  const [payoutAction, setPayoutAction] = useState<PayoutAction | null>(null);

  const summaryQuery = useQuery({
    queryKey: ["admin", "finance", "summary"],
    queryFn: async (): Promise<FinanceSummary> => {
      const res = await apiClient.get(`${API_URL_FINANCE}/admin/summary`);
      return res.data;
    },
  });

  const payoutsQuery = useQuery({
    queryKey: ["admin", "payouts"],
    queryFn: async (): Promise<Payout[]> => {
      const res = await apiClient.get(`${API_URL_FINANCE}/payouts`);
      return res.data;
    },
  });

  const commissionsQuery = useQuery({
    queryKey: ["admin", "finance", "commissions"],
    queryFn: async (): Promise<Commission[]> => {
      const res = await apiClient.get(`${API_URL_FINANCE}/commissions`, { params: { limit: 80 } });
      return res.data;
    },
  });

  const invalidateFinance = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "finance"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] }),
    ]);
  };

  const syncCommissions = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`${API_URL_FINANCE}/commissions/sync`, null, { params: { days_back: 365 } });
      return res.data;
    },
    onSuccess: async () => {
      toast.success("Đã đồng bộ hoa hồng từ đơn hàng");
      await invalidateFinance();
    },
    onError: () => toast.error("Không thể đồng bộ hoa hồng"),
  });

  const updatePayout = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "PROCESSING" | "PAID" | "FAILED" }) => {
      const res = await apiClient.patch(`${API_URL_FINANCE}/payout/${id}`, { status });
      return res.data;
    },
    onSuccess: async (_, variables) => {
      toast.success(variables.status === "PAID" ? "Đã duyệt rút tiền" : variables.status === "FAILED" ? "Đã từ chối yêu cầu" : "Đã chuyển sang xử lý");
      await invalidateFinance();
    },
    onError: (error: any) => toast.error(error?.response?.data?.detail || "Không thể cập nhật yêu cầu rút tiền"),
  });

  const payouts = payoutsQuery.data ?? [];
  const commissions = commissionsQuery.data ?? [];
  const summary = summaryQuery.data;
  const payoutActionText = getPayoutActionText(payoutAction);

  return (
    <>
      <main className="flex-1 overflow-auto bg-slate-50/60 p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Tài chính sàn</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Hoa hồng và duyệt rút tiền</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Đối soát phí sàn 3-7% theo từng đơn, khóa số dư pending payout và duyệt yêu cầu rút tiền của seller.
            </p>
          </div>
          <Button variant="outline" onClick={() => syncCommissions.mutate()} disabled={syncCommissions.isPending}>
            <RefreshCw className={syncCommissions.isPending ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
            Đồng bộ hoa hồng
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={ReceiptText} label="Doanh thu đối soát" value={formatCurrency(summary?.grossRevenue ?? 0)} loading={summaryQuery.isLoading} />
          <MetricCard icon={Percent} label="Phí hoa hồng" value={formatCurrency(summary?.commissionAmount ?? 0)} loading={summaryQuery.isLoading} />
          <MetricCard icon={WalletCards} label="Seller có thể rút" value={formatCurrency(summary?.availableBalance ?? 0)} loading={summaryQuery.isLoading} />
          <MetricCard icon={Clock3} label="Đang chờ duyệt" value={formatCurrency(summary?.pendingPayoutAmount ?? 0)} loading={summaryQuery.isLoading} />
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <SmallStat label="Tổng shop" value={summary?.shopsCount ?? 0} />
          <SmallStat label="Yêu cầu rút tiền" value={summary?.payoutCount ?? 0} hint={`${summary?.pendingPayoutCount ?? 0} đang chờ`} />
          <SmallStat label="Đã thanh toán" value={formatCurrency(summary?.paidPayoutAmount ?? 0)} hint="Tổng payout PAID" />
        </div>

        <CommissionConfigCard />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Yêu cầu rút tiền</CardTitle>
                <CardDescription>{payoutsQuery.isLoading ? "Đang tải..." : `${payouts.length} yêu cầu`}</CardDescription>
              </div>
              <Badge variant="outline">{formatCurrency(summary?.pendingPayoutAmount ?? 0)} pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {payoutsQuery.isError ? (
              <p className="text-sm text-destructive">Không tải được yêu cầu rút tiền.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Yêu cầu</th>
                      <th className="px-4 py-3 text-left">Shop</th>
                      <th className="px-4 py-3 text-right">Số tiền</th>
                      <th className="px-4 py-3 text-center">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-t align-top">
                        <td className="px-4 py-3">
                          <p className="font-medium">#{payout.id}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(payout.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{payout.shop?.name || `Shop #${payout.shopId}`}</p>
                          {payout.paidAt ? <p className="text-xs text-muted-foreground">Paid {formatDateTime(payout.paidAt)}</p> : null}
                          {payout.reviewedBy ? (
                            <p className="text-xs text-muted-foreground">
                              Duyệt bởi {payout.reviewedBy.fullName || payout.reviewedBy.email}
                              {payout.reviewedAt ? ` · ${formatDateTime(payout.reviewedAt)}` : ""}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(payout.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={getStatusClass(payout.status)}>
                            {payout.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={payout.status !== "PENDING" || updatePayout.isPending}
                              onClick={() =>
                                setPayoutAction({
                                  id: payout.id,
                                  status: "PROCESSING",
                                  amount: payout.amount,
                                  shopName: payout.shop?.name || `Shop #${payout.shopId}`,
                                })
                              }
                            >
                              <Clock3 className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              disabled={!["PENDING", "PROCESSING"].includes(payout.status) || updatePayout.isPending}
                              onClick={() =>
                                setPayoutAction({
                                  id: payout.id,
                                  status: "PAID",
                                  amount: payout.amount,
                                  shopName: payout.shop?.name || `Shop #${payout.shopId}`,
                                })
                              }
                            >
                              <CheckCircle2 className="size-4" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={!["PENDING", "PROCESSING"].includes(payout.status) || updatePayout.isPending}
                              onClick={() =>
                                setPayoutAction({
                                  id: payout.id,
                                  status: "FAILED",
                                  amount: payout.amount,
                                  shopName: payout.shop?.name || `Shop #${payout.shopId}`,
                                })
                              }
                            >
                              <XCircle className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!payouts.length ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          Chưa có yêu cầu rút tiền.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          </Card>

          <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Ledger hoa hồng</CardTitle>
                <CardDescription>{commissionsQuery.isLoading ? "Đang tải..." : `${commissions.length} dòng gần nhất`}</CardDescription>
              </div>
              <Badge variant="outline">{summary?.commissionCount ?? 0} dòng</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {commissionsQuery.isError ? (
              <p className="text-sm text-destructive">Không tải được ledger hoa hồng.</p>
            ) : (
              <div className="max-h-140 overflow-auto rounded-lg border bg-white">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Đơn / sản phẩm</th>
                      <th className="px-4 py-3 text-left">Shop</th>
                      <th className="px-4 py-3 text-right">Hoa hồng</th>
                      <th className="px-4 py-3 text-center">TT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">
                          <p className="font-medium">Đơn #{item.orderId}</p>
                          {item.order?.checkoutGroupCode ? (
                            <p className="font-mono text-xs text-orange-700">
                              {item.order.checkoutGroupCode}{item.order.checkoutGroupPrimary ? " · payment chính" : ""}
                            </p>
                          ) : null}
                          <p className="max-w-60 truncate text-xs text-muted-foreground">{item.orderItem?.productName ?? `Order item #${item.orderItemId}`}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Store className="size-4 text-muted-foreground" />
                            <span className="max-w-40 truncate">{item.shop?.name ?? `Shop #${item.shopId}`}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Gross {formatCurrency(item.grossAmount)} · rate {formatPercent(item.commissionRate)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-semibold">{formatCurrency(item.commissionAmount)}</p>
                          <p className="text-xs text-muted-foreground">Net {formatCurrency(item.sellerNetAmount)}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={getStatusClass(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {!commissions.length ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          Chưa có ledger hoa hồng. Bấm đồng bộ sau khi có đơn hoàn tất.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      </main>
      <ConfirmDialog
        open={payoutAction !== null}
        title={payoutActionText.title}
        description={payoutActionText.description}
        confirmLabel={payoutActionText.confirmLabel}
        cancelLabel="Kiểm tra lại"
        variant={payoutAction?.status === "FAILED" ? "destructive" : "default"}
        isPending={updatePayout.isPending}
        onOpenChange={(open) => {
          if (!open && !updatePayout.isPending) setPayoutAction(null);
        }}
        onConfirm={() => {
          if (!payoutAction) return;
          updatePayout.mutate(
            { id: payoutAction.id, status: payoutAction.status },
            { onSuccess: () => setPayoutAction(null) },
          );
        }}
      />
    </>
  );
}

function getPayoutActionText(action: PayoutAction | null) {
  if (!action) {
    return {
      title: "Xác nhận cập nhật payout",
      description: "",
      confirmLabel: "Xác nhận",
    };
  }

  const amount = formatCurrency(action.amount);
  if (action.status === "PAID") {
    return {
      title: "Xác nhận duyệt rút tiền",
      description: `Duyệt payout #${action.id} của ${action.shopName} với số tiền ${amount}. Sau khi duyệt, yêu cầu sẽ được chốt PAID và không thể chuyển sang trạng thái khác.`,
      confirmLabel: "Duyệt thanh toán",
    };
  }
  if (action.status === "FAILED") {
    return {
      title: "Xác nhận từ chối rút tiền",
      description: `Từ chối payout #${action.id} của ${action.shopName} với số tiền ${amount}. Seller sẽ thấy trạng thái từ chối trong lịch sử rút tiền.`,
      confirmLabel: "Từ chối yêu cầu",
    };
  }
  return {
    title: "Xác nhận chuyển sang xử lý",
    description: `Chuyển payout #${action.id} của ${action.shopName} với số tiền ${amount} sang trạng thái PROCESSING để đánh dấu đang xử lý thanh toán.`,
    confirmLabel: "Chuyển xử lý",
  };
}

function MetricCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{loading ? "..." : value}</p>
        </div>
        <div className="rounded-xl bg-orange-100 p-3 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function SmallStat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
