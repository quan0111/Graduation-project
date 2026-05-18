import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const getOrderIdFromProviderOrderId = (providerOrderId: string | null) => {
  if (!providerOrderId) {
    return null;
  }

  const match = providerOrderId.match(/^ORDER-(\d+)-/);
  return match?.[1] ?? null;
};

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();

  const resultCode = searchParams.get("resultCode");
  const providerOrderId = searchParams.get("orderId");
  const orderId = getOrderIdFromProviderOrderId(providerOrderId);
  const message = searchParams.get("message");
  const transId = searchParams.get("transId");

  const isSuccess = resultCode === "0";
  const isPending = resultCode === "9000" || resultCode === "7000" || resultCode === "7002";
  const Icon = isSuccess ? CheckCircle2 : isPending ? Clock : XCircle;

  return (
    <div className="min-h-[70vh] bg-[#f6f7fb] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
          <Icon className={isSuccess ? "size-9 text-emerald-600" : isPending ? "size-9 text-amber-600" : "size-9 text-red-600"} />
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-slate-950">
          {isSuccess ? "Thanh toán thành công" : isPending ? "Thanh toán đang xử lý" : "Thanh toán chưa thành công"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {message || "Hệ thống đã nhận kết quả trả về từ cổng thanh toán MoMo."}
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-700">
          <div className="flex justify-between gap-4">
            <span>Mã đơn MoMo</span>
            <span className="font-medium text-slate-950">{providerOrderId || "Không có"}</span>
          </div>
          <div className="mt-3 flex justify-between gap-4">
            <span>Mã giao dịch</span>
            <span className="font-medium text-slate-950">{transId || "Chưa có"}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {orderId ? (
            <Link
              to={`/orders/${orderId}`}
              className="flex-1 rounded-full bg-[#ee4d2d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d93f21]"
            >
              Xem đơn hàng
            </Link>
          ) : null}
          <Link
            to="/orders"
            className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Danh sách đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
