import { RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { useUserReturnRequests } from "@/modules/return-request/api/get-return";
import { useAuthStore } from "@/stores/auth.store";

const statusLabel: Record<string, string> = {
  REQUESTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PICKED_UP: "Đã lấy hàng",
  RECEIVED: "Shop đã nhận",
  REFUNDED: "Đã hoàn tiền",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function ReturnHistoryPage() {
  const user = useAuthStore((store) => store.user);
  const { data: returns = [], isLoading, isError } = useUserReturnRequests(Number(user?.id || 0), {
    enabled: Boolean(user?.id),
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Đang tải lịch sử đổi trả...</div>;
  }

  if (isError) {
    return <div className="p-6 text-sm text-rose-500">Không thể tải lịch sử đổi trả.</div>;
  }

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-600">
                <RotateCcw className="size-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em]">Đổi trả</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-slate-950">Lịch sử yêu cầu đổi trả</h1>
              <p className="mt-2 text-sm text-slate-500">Theo dõi trạng thái duyệt, nhận hàng và hoàn tiền cho từng yêu cầu.</p>
            </div>
            <Link
              to="/orders"
              className="inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-slate-50"
            >
              Xem đơn hàng
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-50 text-left text-slate-600">
                <tr>
                  <th className="px-5 py-3">Mã yêu cầu</th>
                  <th className="px-5 py-3">Đơn hàng</th>
                  <th className="px-5 py-3">Sản phẩm</th>
                  <th className="px-5 py-3">Số tiền</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((item) => (
                  <tr key={item.id} className="border-t border-orange-100">
                    <td className="px-5 py-4 font-semibold text-slate-900">#{item.id}</td>
                    <td className="px-5 py-4">
                      <Link className="text-orange-600 hover:underline" to={`/orders/${item.orderId}`}>
                        #{item.orderId}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.items?.length || 0}</td>
                    <td className="px-5 py-4 text-slate-900">{formatCurrency(item.refundAmount)}</td>
                    <td className="px-5 py-4">
                      <Badge variant="outline">{statusLabel[item.status] || item.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
                {!returns.length && (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                      Chưa có yêu cầu đổi trả nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
