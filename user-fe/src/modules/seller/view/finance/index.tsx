import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, CircleDollarSign, Landmark, RefreshCcw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/app-dialog";
import {
  useCreateSellerPayout,
  useSellerInventoryLedger,
  useSellerReport,
  useSellerWallet,
} from "@/modules/seller/api/finance";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { formatCurrency } from "@/modules/seller/utils/dashboard";
import { formatDate, formatDateTime } from "@/lib/date";

const payoutStatusLabel: Record<string, string> = {
  PENDING: "Chờ duyệt",
  PROCESSING: "Đang xử lý",
  PAID: "Đã thanh toán",
  FAILED: "Từ chối",
  CANCELLED: "Đã hủy",
};

const payoutStatusClass = (status: string) => {
  if (status === "PAID") return "bg-emerald-50 text-emerald-700";
  if (status === "FAILED" || status === "CANCELLED") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
};

export default function SellerFinancePage() {
  const [payoutAmount, setPayoutAmount] = useState("");
  const [confirmPayoutAmount, setConfirmPayoutAmount] = useState<number | null>(null);
  const { data: wallet, isLoading: walletLoading } = useSellerWallet();
  const { data: report, isLoading: reportLoading } = useSellerReport(30);
  const { data: ledger = [] } = useSellerInventoryLedger();
  const payoutMutation = useCreateSellerPayout();

  const chartData = useMemo(
    () =>
      (report?.dailyRevenue ?? []).map((item) => ({
        ...item,
        label: formatDate(item.date).slice(0, 5),
      })),
    [report],
  );

  const submitPayout = async () => {
    if (!wallet) return;
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0 || amount > wallet.availableBalance) {
      toast.error("Số tiền rút không hợp lệ");
      return;
    }
    setConfirmPayoutAmount(amount);
  };

  const confirmPayout = async () => {
    if (!wallet || !confirmPayoutAmount) return;
    try {
      await payoutMutation.mutateAsync({ shopId: wallet.shopId, amount: confirmPayoutAmount });
      toast.success("Đã gửi yêu cầu rút tiền");
      setPayoutAmount("");
      setConfirmPayoutAmount(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể gửi yêu cầu rút tiền");
    }
  };

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-sm uppercase tracking-[0.24em] text-[#ee4d2d]">Tài chính người bán</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">Ví seller và đối soát</h1>
          <p className="mt-2 text-sm text-slate-500">
            Dữ liệu lấy từ đơn hàng, commission, payout và lịch sử tồn kho thật của shop.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Banknote} label="Có thể rút" value={formatCurrency(wallet?.availableBalance ?? 0)} loading={walletLoading} />
          <MetricCard icon={TrendingUp} label="Doanh thu hoàn tất" value={formatCurrency(wallet?.completedRevenue ?? 0)} loading={walletLoading} />
          <MetricCard icon={CircleDollarSign} label="Phí sàn" value={formatCurrency(wallet?.commission ?? 0)} loading={walletLoading} />
          <MetricCard icon={RefreshCcw} label="Tiền hoàn/hủy" value={formatCurrency((wallet?.refundedRevenue ?? 0) + (wallet?.cancelledRevenue ?? 0))} loading={walletLoading} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Doanh thu 30 ngày</CardTitle>
              <p className="text-sm text-slate-500">
                Tỉ lệ hoàn {report?.returnRate ?? 0}% · tỉ lệ hủy {report?.cancelRate ?? 0}% · {report?.totalOrders ?? 0} đơn
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {reportLoading ? (
                  <div className="h-full animate-pulse rounded-2xl bg-slate-100" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}tr`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area dataKey="revenue" stroke="#ee4d2d" fill="#fed7aa" strokeWidth={3} type="monotone" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Yêu cầu rút tiền</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                min={0}
                value={payoutAmount}
                onChange={(event) => setPayoutAmount(event.target.value)}
                placeholder="Nhập số tiền muốn rút"
              />
              <Button className="w-full bg-[#ee4d2d] hover:bg-[#d93f21]" onClick={submitPayout} disabled={payoutMutation.isPending}>
                <Landmark className="mr-2 size-4" />
                Gửi yêu cầu rút tiền
              </Button>
              <p className="text-xs leading-5 text-slate-500">
                Sau khi xác nhận, yêu cầu sẽ chuyển sang trạng thái chờ admin duyệt. Số tiền pending sẽ được giữ lại khi tính số dư có thể rút.
              </p>
              <div className="space-y-2">
                {(wallet?.payouts ?? []).slice(0, 5).map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                    <div>
                      <p className="font-medium">{formatCurrency(payout.amount)}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(payout.createdAt)}</p>
                      {payout.reviewedBy ? (
                        <p className="text-xs text-slate-500">
                          Duyệt bởi {payout.reviewedBy.fullName || payout.reviewedBy.email}
                          {payout.reviewedAt ? ` · ${formatDateTime(payout.reviewedAt)}` : ""}
                        </p>
                      ) : null}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payoutStatusClass(payout.status)}`}>
                      {payoutStatusLabel[payout.status] ?? payout.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Top sản phẩm theo doanh thu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(report?.topProducts ?? []).map((product) => (
                <div key={product.productId} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">Đã bán {product.sold}</p>
                  </div>
                  <p className="font-semibold text-[#ee4d2d]">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Lịch sử tồn kho gần nhất</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ledger.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.product?.name ?? "Sản phẩm"}</p>
                    <span className={item.quantityChange > 0 ? "text-emerald-600" : "text-rose-600"}>
                      {item.quantityChange > 0 ? "+" : ""}
                      {item.quantityChange}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.type} · tồn {item.stockBefore ?? "-"} → {item.stockAfter ?? "-"} · {formatDateTime(item.createdAt)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
      <ConfirmDialog
        open={confirmPayoutAmount !== null}
        title="Xác nhận yêu cầu rút tiền"
        description={`Bạn muốn gửi yêu cầu rút ${formatCurrency(confirmPayoutAmount ?? 0)}. Số dư hiện có thể rút là ${formatCurrency(wallet?.availableBalance ?? 0)}. Sau khi gửi, admin sẽ kiểm tra và duyệt thanh toán cho seller.`}
        confirmLabel="Xác nhận gửi yêu cầu"
        cancelLabel="Kiểm tra lại"
        isPending={payoutMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !payoutMutation.isPending) setConfirmPayoutAmount(null);
        }}
        onConfirm={confirmPayout}
      />
    </SellerDashboardLayout>
  );
}

function MetricCard({ icon: Icon, label, value, loading }: { icon: any; label: string; value: string; loading?: boolean }) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{loading ? "..." : value}</p>
        </div>
        <div className="rounded-2xl bg-orange-100 p-3 text-[#ee4d2d]">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
