import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, PackageCheck, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMarkReturnReceived, useRefundReturnRequest } from "@/modules/return-request/api/create-return";
import { type ReturnRequest, useSellerReturnRequests } from "@/modules/return-request/api/get-return";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";

type ReturnStatusFilter =
  | "ALL"
  | "REQUEST_RETURN"
  | "SELLER_REVIEW"
  | "RETURN_APPROVED"
  | "PICKUP_RETURN_IN_TRANSIT"
  | "RETURN_RECEIVED"
  | "RETURN_REJECTED"
  | "REFUNDING"
  | "REFUNDED"
  | "REQUESTED"
  | "APPROVED"
  | "PICKED_UP"
  | "RECEIVED"
  | "REJECTED";

const statusOptions: Array<{ value: ReturnStatusFilter; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "REQUESTED", label: "Chờ admin duyệt" },
  { value: "APPROVED", label: "Chờ seller hoàn tiền" },
  { value: "PICKED_UP", label: "Đang chuyển hoàn" },
  { value: "RECEIVED", label: "Đã nhận hàng hoàn" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "REJECTED", label: "Bị từ chối" },
];

const statusMeta: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  REQUESTED: { label: "Chờ admin duyệt", variant: "secondary" },
  APPROVED: { label: "Admin đã duyệt", variant: "default" },
  PICKED_UP: { label: "Đang chuyển hoàn", variant: "secondary" },
  RECEIVED: { label: "Đã nhận hàng hoàn", variant: "default" },
  REJECTED: { label: "Bị từ chối", variant: "destructive" },
  REFUNDED: { label: "Đã hoàn tiền", variant: "outline" },
};

const returnStatusMetaOverrides: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  REQUEST_RETURN: { label: "Khách yêu cầu trả hàng", variant: "secondary" },
  SELLER_REVIEW: { label: "Seller xem xét", variant: "secondary" },
  RETURN_APPROVED: { label: "Đồng ý trả hàng", variant: "default" },
  PICKUP_RETURN_IN_TRANSIT: { label: "Đang trả hàng", variant: "secondary" },
  RETURN_RECEIVED: { label: "Đã nhận hàng trả", variant: "default" },
  RETURN_REJECTED: { label: "Từ chối yêu cầu", variant: "destructive" },
  REFUND_REJECTED: { label: "Từ chối hoàn tiền", variant: "destructive" },
  REFUNDING: { label: "Đang hoàn tiền", variant: "secondary" },
};

const returnStatusGroups: Record<string, string[]> = {
  REQUESTED: ["REQUESTED", "REQUEST_RETURN", "SELLER_REVIEW"],
  APPROVED: ["APPROVED", "RETURN_APPROVED"],
  PICKED_UP: ["PICKED_UP", "PICKUP_RETURN_IN_TRANSIT"],
  RECEIVED: ["RECEIVED", "RETURN_RECEIVED"],
  REJECTED: ["REJECTED", "RETURN_REJECTED", "REFUND_REJECTED"],
  REFUNDED: ["REFUNDING", "REFUNDED"],
};

const matchesReturnStatus = (status: string, filter: ReturnStatusFilter) => {
  if (filter === "ALL") return true;
  return (returnStatusGroups[filter] ?? [filter]).includes(status);
};

const isReturnStatus = (status: string, values: string[]) => values.includes(status);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getRefundAmount = (returnReq: ReturnRequest) =>
  returnReq.refundAmount ??
  returnReq.items.reduce((sum: number, item: any) => sum + Number(item.refundAmount || 0), 0);

const getTotalQuantity = (returnReq: ReturnRequest) =>
  returnReq.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);

export default function SellerReturnsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnStatusFilter>("ALL");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [refundCandidate, setRefundCandidate] = useState<ReturnRequest | null>(null);
  const queryClient = useQueryClient();

  const { data: returns = [], isLoading, isError } = useSellerReturnRequests();
  const refundMutation = useRefundReturnRequest();
  const receivedMutation = useMarkReturnReceived();

  const filteredReturns = useMemo(
    () =>
      returns.filter((returnReq) => {
        const searchValue = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !searchValue ||
          returnReq.orderId.toString().includes(searchValue) ||
          returnReq.reason.toLowerCase().includes(searchValue);
        const matchesStatus = matchesReturnStatus(returnReq.status, statusFilter);
        return matchesSearch && matchesStatus;
      }),
    [returns, searchTerm, statusFilter],
  );

  const handleRefund = (returnId: number) => {

    refundMutation.mutate(returnId, {
      onSuccess: async () => {
        toast.success("Đã xác nhận hoàn tiền cho user");
        setSelectedReturn(null);
        setRefundCandidate(null);
        await queryClient.invalidateQueries({ queryKey: ["returns", "seller"] });
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail;
        toast.error(typeof detail === "string" ? detail : "Không thể xác nhận hoàn tiền");
      },
    });
  };

  const handleReceived = (returnId: number) => {
    receivedMutation.mutate(returnId, {
      onSuccess: async () => {
        toast.success("Đã xác nhận nhận hàng hoàn và cập nhật tồn kho");
        setSelectedReturn(null);
        await queryClient.invalidateQueries({ queryKey: ["returns", "seller"] });
        await queryClient.invalidateQueries({ queryKey: ["seller", "dashboard"] });
        await queryClient.invalidateQueries({ queryKey: ["inventory", "seller"] });
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail;
        toast.error(typeof detail === "string" ? detail : "Không thể xác nhận nhận hàng hoàn");
      },
    });
  };

  const renderStatusBadge = (status: string) => {
    const meta = returnStatusMetaOverrides[status] || statusMeta[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
  };

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-sm uppercase tracking-[0.24em] text-[#ee4d2d]">Returns & Refunds</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">Yêu cầu trả hàng / hoàn tiền</h1>
          <p className="mt-2 text-sm text-slate-500">
            Seller chỉ xác nhận hoàn tiền sau khi admin đã duyệt yêu cầu. Các yêu cầu mới sẽ ở trạng thái chờ admin.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo mã đơn hàng hoặc lý do..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ReturnStatusFilter)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {isLoading && <p className="text-sm text-slate-500">Đang tải yêu cầu hoàn tiền...</p>}
            {isError && <p className="text-sm text-rose-500">Không thể tải danh sách hoàn tiền.</p>}

            {!isLoading && !filteredReturns.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <p className="font-medium text-slate-900">Chưa có yêu cầu phù hợp</p>
                <p className="mt-2 text-sm text-slate-500">Khi admin duyệt, seller có thể xác nhận hoàn tiền tại đây.</p>
              </div>
            ) : null}

            {filteredReturns.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Mã đơn</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Lý do</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Số lượng</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Số tiền</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReturns.map((returnReq) => (
                      <tr key={returnReq.id} className="border-b border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-900">#{returnReq.orderId}</td>
                        <td className="px-4 py-3 text-slate-600">{returnReq.reason}</td>
                        <td className="px-4 py-3 text-slate-600">{getTotalQuantity(returnReq)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatCurrency(getRefundAmount(returnReq))}</td>
                        <td className="px-4 py-3">{renderStatusBadge(returnReq.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedReturn(returnReq)}>
                              <Eye className="size-4" />
                            </Button>
                            {isReturnStatus(returnReq.status, ["APPROVED", "RETURN_APPROVED", "PICKED_UP", "PICKUP_RETURN_IN_TRANSIT"]) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReceived(returnReq.id)}
                                disabled={receivedMutation.isPending}
                              >
                                <PackageCheck className="mr-2 size-4" />
                                Đã nhận hàng
                              </Button>
                            )}
                            {isReturnStatus(returnReq.status, ["RECEIVED", "RETURN_RECEIVED", "REFUNDING"]) && (
                              <Button
                                size="sm"
                                onClick={() => setRefundCandidate(returnReq)}
                                disabled={refundMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="mr-2 size-4" />
                                Hoàn tiền
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Chi tiết yêu cầu #{selectedReturn.id}</h2>
              <button onClick={() => setSelectedReturn(null)} className="text-slate-400 hover:text-slate-600">
                <X className="size-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <Info label="Mã đơn hàng" value={`#${selectedReturn.orderId}`} />
                <div>
                  <p className="text-slate-500">Trạng thái</p>
                  <div className="mt-1">{renderStatusBadge(selectedReturn.status)}</div>
                </div>
                <Info label="Số tiền hoàn" value={formatCurrency(getRefundAmount(selectedReturn))} />
                <Info label="Ngày tạo" value={new Date(selectedReturn.createdAt).toLocaleString("vi-VN")} />
              </div>

              <ReturnTimeline status={selectedReturn.status} />

              <div>
                <p className="text-slate-500">Lý do trả hàng</p>
                <p className="mt-1 text-slate-900">{selectedReturn.reason}</p>
              </div>

              <div>
                <p className="mb-2 text-slate-500">Sản phẩm trả</p>
                <div className="space-y-2">
                  {selectedReturn.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between rounded-lg bg-slate-50 p-3">
                      <span>{item.orderItem?.productName || `Sản phẩm #${item.orderItemId}`}</span>
                      <span>
                        x{item.quantity} · {formatCurrency(Number(item.refundAmount || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn.evidences.length > 0 && (
                <div>
                  <p className="mb-2 text-slate-500">Bằng chứng</p>
                  <div className="flex gap-2">
                    {selectedReturn.evidences.map((evidence: any) => (
                      <img
                        key={evidence.id}
                        src={evidence.imageUrl}
                        alt="Evidence"
                        className="size-24 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {isReturnStatus(selectedReturn.status, ["APPROVED", "RETURN_APPROVED", "PICKED_UP", "PICKUP_RETURN_IN_TRANSIT"]) && (
                <div className="flex justify-end border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleReceived(selectedReturn.id)}
                    disabled={receivedMutation.isPending}
                  >
                    <PackageCheck className="mr-2 size-4" />
                    Xác nhận đã nhận hàng hoàn
                  </Button>
                </div>
              )}

              {isReturnStatus(selectedReturn.status, ["RECEIVED", "RETURN_RECEIVED", "REFUNDING"]) && (
                <div className="flex justify-end border-t pt-4">
                  <Button
                    onClick={() => setRefundCandidate(selectedReturn)}
                    disabled={refundMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Xác nhận đã hoàn tiền
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {refundCandidate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Xác nhận hoàn tiền?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Vui lòng chỉ xác nhận khi shop đã hoàn tiền cho đơn #{refundCandidate.orderId}.
                  Số tiền hoàn là {formatCurrency(getRefundAmount(refundCandidate))}.
                </p>
              </div>
              <button
                onClick={() => setRefundCandidate(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRefundCandidate(null)} disabled={refundMutation.isPending}>
                Hủy
              </Button>
              <Button
                onClick={() => handleRefund(refundCandidate.id)}
                disabled={refundMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {refundMutation.isPending ? "Đang xác nhận..." : "Đã hoàn tiền"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SellerDashboardLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}

function ReturnTimeline({ status }: { status: string }) {
  const steps = [
    { key: "REQUESTED", label: "User gửi yêu cầu" },
    { key: "APPROVED", label: "Admin duyệt" },
    { key: "RECEIVED", label: "Seller nhận hàng hoàn" },
    { key: "REFUNDED", label: "Seller hoàn tiền" },
  ];
  const order = ["REQUESTED", "APPROVED", "PICKED_UP", "RECEIVED", "REFUNDED"];
  const timelineStatusAliases: Record<string, string> = {
    REQUEST_RETURN: "REQUESTED",
    SELLER_REVIEW: "REQUESTED",
    RETURN_APPROVED: "APPROVED",
    PICKUP_RETURN_IN_TRANSIT: "PICKED_UP",
    RETURN_RECEIVED: "RECEIVED",
    REFUNDING: "RECEIVED",
  };
  const normalizedStatus = timelineStatusAliases[status] ?? status;
  const currentIndex = order.indexOf(normalizedStatus);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-900">Tiến trình đổi trả</p>
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step) => {
          const stepIndex = order.indexOf(step.key);
          const done = currentIndex >= stepIndex && currentIndex !== -1;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                  done ? "bg-emerald-600 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200"
                }`}
              >
                {done ? "✓" : stepIndex + 1}
              </span>
              <span className={done ? "text-sm font-medium text-slate-900" : "text-sm text-slate-500"}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
