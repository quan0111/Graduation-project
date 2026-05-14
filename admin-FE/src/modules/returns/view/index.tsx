import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Eye, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type ReturnRequest,
  useAdminReturnRequests,
  useReviewReturnRequest,
} from "@/modules/returns/api/returns";

type ReturnStatusFilter = "ALL" | "REQUESTED" | "APPROVED" | "PICKED_UP" | "RECEIVED" | "REJECTED" | "REFUNDED";

const statusOptions: Array<{ value: ReturnStatusFilter; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "REQUESTED", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "PICKED_UP", label: "Đang chuyển hoàn" },
  { value: "RECEIVED", label: "Seller đã nhận hàng" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "REJECTED", label: "Từ chối" },
];

const statusMeta: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  REQUESTED: { label: "Chờ admin duyệt", variant: "secondary" },
  APPROVED: { label: "Đã duyệt - chờ seller hoàn tiền", variant: "default" },
  PICKED_UP: { label: "Đang chuyển hoàn", variant: "secondary" },
  RECEIVED: { label: "Seller đã nhận hàng", variant: "default" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
  REFUNDED: { label: "Đã hoàn tiền", variant: "outline" },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getRefundAmount = (returnReq: ReturnRequest) =>
  returnReq.refundAmount ??
  returnReq.items.reduce((sum: number, item: any) => sum + Number(item.refundAmount || 0), 0);

export default function ReturnsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnStatusFilter>("ALL");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [rejectCandidate, setRejectCandidate] = useState<ReturnRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const queryClient = useQueryClient();

  const { data: returns = [], isLoading, isError } = useAdminReturnRequests();
  const reviewMutation = useReviewReturnRequest();

  const filteredReturns = useMemo(
    () =>
      returns.filter((returnReq) => {
        const searchValue = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !searchValue ||
          returnReq.orderId.toString().includes(searchValue) ||
          returnReq.reason.toLowerCase().includes(searchValue) ||
          (returnReq.user?.email || "").toLowerCase().includes(searchValue);
        const matchesStatus = statusFilter === "ALL" || returnReq.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [returns, searchTerm, statusFilter],
  );

  const handleReview = (returnId: number, status: "APPROVED" | "REJECTED", rejectReasonInput?: string) => {
    reviewMutation.mutate(
      {
        returnId,
        payload: { status, rejectReason: rejectReasonInput?.trim() || undefined },
      },
      {
        onSuccess: async () => {
          toast.success(status === "APPROVED" ? "Đã duyệt yêu cầu hoàn tiền" : "Đã từ chối yêu cầu hoàn tiền");
          setSelectedReturn(null);
          setRejectCandidate(null);
          setRejectReason("");
          await queryClient.invalidateQueries({ queryKey: ["returns", "admin"] });
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.detail;
          toast.error(typeof detail === "string" ? detail : "Không thể xử lý yêu cầu");
        },
      },
    );
  };

  const renderStatusBadge = (status: string) => {
    const meta = statusMeta[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
  };

  return (
    <main className="flex-1 space-y-6 overflow-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Duyệt trả hàng / hoàn tiền</h1>
        <p className="text-sm text-muted-foreground">
          Admin duyệt hoặc từ chối yêu cầu. Seller chỉ được hoàn tiền sau khi yêu cầu chuyển sang trạng thái đã duyệt.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, email hoặc lý do..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ReturnStatusFilter)}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">Đang tải yêu cầu hoàn tiền...</p>}
          {isError && <p className="text-sm text-destructive">Không thể tải danh sách yêu cầu.</p>}

          {!isLoading && !filteredReturns.length ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              Chưa có yêu cầu phù hợp.
            </div>
          ) : null}

          {filteredReturns.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Lý do</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Số tiền</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((returnReq) => (
                    <tr key={returnReq.id} className="border-b">
                      <td className="px-4 py-3 font-medium">#{returnReq.orderId}</td>
                      <td className="px-4 py-3">{returnReq.user?.email || `User #${returnReq.userId}`}</td>
                      <td className="px-4 py-3">{returnReq.reason}</td>
                      <td className="px-4 py-3">{formatCurrency(getRefundAmount(returnReq))}</td>
                      <td className="px-4 py-3">{renderStatusBadge(returnReq.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedReturn(returnReq)}>
                            <Eye className="size-4" />
                          </Button>
                          {returnReq.status === "REQUESTED" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleReview(returnReq.id, "APPROVED")}
                                disabled={reviewMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Check className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectCandidate(returnReq)}
                                disabled={reviewMutation.isPending}
                              >
                                <X className="size-4" />
                              </Button>
                            </>
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

      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chi tiết yêu cầu #{selectedReturn.id}</h2>
              <button onClick={() => setSelectedReturn(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <Info label="Mã đơn hàng" value={`#${selectedReturn.orderId}`} />
                <Info label="Khách hàng" value={selectedReturn.user?.email || `User #${selectedReturn.userId}`} />
                <Info label="Số tiền hoàn" value={formatCurrency(getRefundAmount(selectedReturn))} />
                <div>
                  <p className="text-muted-foreground">Trạng thái</p>
                  <div className="mt-1">{renderStatusBadge(selectedReturn.status)}</div>
                </div>
              </div>

              <Info label="Lý do trả hàng" value={selectedReturn.reason} />

              <div>
                <p className="mb-2 text-muted-foreground">Sản phẩm trả</p>
                <div className="space-y-2">
                  {selectedReturn.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between rounded-lg bg-muted p-3">
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
                  <p className="mb-2 text-muted-foreground">Bằng chứng</p>
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

              {selectedReturn.status === "REQUESTED" && (
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button variant="destructive" onClick={() => setRejectCandidate(selectedReturn)}>
                    Từ chối
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleReview(selectedReturn.id, "APPROVED")}>
                    Duyệt hoàn tiền
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectCandidate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Từ chối yêu cầu hoàn tiền</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nhập lý do rõ ràng để người mua và seller theo dõi lại quyết định.
                </p>
              </div>
              <button onClick={() => setRejectCandidate(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ví dụ: Bằng chứng không đủ rõ, sản phẩm không thuộc điều kiện đổi trả..."
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectCandidate(null)} disabled={reviewMutation.isPending}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || reviewMutation.isPending}
                onClick={() => handleReview(rejectCandidate.id, "REJECTED", rejectReason.trim())}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
