import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, RefreshCw, ShoppingCart, XCircle } from "lucide-react";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";

type Payment = {
  id: number;
  orderId: number;
  method: string;
  status: string;
  amount?: number | null;
  checkoutGroupCode?: string | null;
  checkoutGroupId?: number | null;
  orderIds?: number[];
  providerOrderId?: string | null;
  transactionId?: string | null;
  providerMessage?: string | null;
};

const SUCCESS_STATUSES = new Set(["SUCCESS", "PAYMENT_SUCCESS"]);
const FAILED_STATUSES = new Set(["FAILED", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]);
const PENDING_STATUSES = new Set(["PENDING", "PENDING_PAYMENT"]);

const normalize = (value?: string | null) => String(value || "").toUpperCase();

const getOrderIdFromProviderOrderId = (providerOrderId: string | null) => {
  if (!providerOrderId) {
    return null;
  }

  const match = providerOrderId.match(/^ORDER-(\d+)-/);
  return match?.[1] ?? null;
};

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();

  const rawOrderId = searchParams.get("orderId");
  const providerOrderId = searchParams.get("providerOrderId") || rawOrderId || searchParams.get("vnp_TxnRef");
  const orderId = rawOrderId && /^\d+$/.test(rawOrderId)
    ? rawOrderId
    : getOrderIdFromProviderOrderId(providerOrderId);
  const gateway = searchParams.get("gateway") || (searchParams.get("vnp_ResponseCode") ? "vnpay" : "momo");
  const gatewayName = gateway.toUpperCase() === "VNPAY" ? "VNPay" : "MoMo";
  const statusParam = normalize(searchParams.get("status"));
  const gatewayMessage = searchParams.get("message") || searchParams.get("vnp_Message") || "";
  const transId = searchParams.get("transId") || searchParams.get("vnp_TransactionNo") || "";

  const { data: payment, isFetching } = useQuery({
    queryKey: ["payment-return", orderId],
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const status = normalize((query.state.data as Payment | undefined)?.status);
      return PENDING_STATUSES.has(status) ? 4000 : false;
    },
    queryFn: async () => {
      const res = await apiClient.get<Payment>(`${API_URL_ORDER}/payment/order/${orderId}`);
      return res.data;
    },
  });

  const status = normalize(payment?.status) || statusParam;
  const orderCount = payment?.orderIds?.length ?? 0;
  const ordersHref = payment?.checkoutGroupCode
    ? `/orders?checkoutGroup=${encodeURIComponent(payment.checkoutGroupCode)}`
    : "/orders";
  const isSuccess = SUCCESS_STATUSES.has(status) || statusParam === "SUCCESS";
  const isFailed = FAILED_STATUSES.has(status) || statusParam === "FAILED";
  const isPending = !isSuccess && !isFailed;

  const view = useMemo(() => {
    if (isSuccess) {
      return {
        Icon: CheckCircle2,
        iconClass: "text-emerald-600",
        title: "Thanh toán thành công",
        description: orderCount > 1
          ? `Hệ thống đã xác nhận thanh toán và tạo ${orderCount} hóa đơn theo từng shop.`
          : "Hệ thống đã xác nhận thanh toán và hóa đơn đã được tạo. Giỏ hàng của các sản phẩm đã thanh toán cũng đã được xóa.",
      };
    }

    if (isFailed) {
      return {
        Icon: XCircle,
        iconClass: "text-red-600",
        title: "Thanh toán chưa thành công",
        description: "Hóa đơn chưa được tạo. Giỏ hàng của bạn vẫn được giữ để kiểm tra lại hoặc thanh toán lại.",
      };
    }

    return {
      Icon: Clock,
      iconClass: "text-amber-600",
      title: "Đang chờ xác nhận thanh toán",
      description: "Cổng thanh toán đã trả người dùng về website. Hệ thống đang kiểm tra IPN/callback trước khi tạo hóa đơn.",
    };
  }, [isFailed, isSuccess, orderCount]);

  const Icon = view.Icon;
  const displayProviderOrderId = payment?.providerOrderId || providerOrderId;
  const displayTransactionId = payment?.transactionId || transId;
  const displayMessage = payment?.providerMessage || gatewayMessage;

  return (
    <div className="min-h-[70vh] bg-[#f6f7fb] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
          {isFetching && isPending ? (
            <RefreshCw className="size-9 animate-spin text-amber-600" />
          ) : (
            <Icon className={`size-9 ${view.iconClass}`} />
          )}
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-slate-950">{view.title}</h1>
        {displayMessage ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">{displayMessage}</p>
        ) : null}
        <p className="mt-2 text-sm leading-6 text-slate-600">{view.description}</p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-700">
          <Info label={`Mã đơn ${gatewayName}`} value={displayProviderOrderId || "Không có"} />
          <Info label="Mã giao dịch" value={displayTransactionId || "Chưa có"} />
          <Info label="Trạng thái hệ thống" value={payment?.status || status || "Đang kiểm tra"} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isSuccess ? (
            <Link
              to={ordersHref}
              className="flex-1 rounded-full bg-[#ee4d2d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d93f21]"
            >
              Xem hóa đơn
            </Link>
          ) : null}

          {isFailed ? (
            <>
              <Link
                to="/checkout"
                className="flex-1 rounded-full bg-[#ee4d2d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d93f21]"
              >
                Thanh toán lại
              </Link>
              <Link
                to="/cart"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ShoppingCart className="size-4" />
                Xem giỏ hàng
              </Link>
            </>
          ) : null}

          {isPending ? (
            <Link
              to="/checkout"
              className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Quay lại checkout
            </Link>
          ) : null}

          {!isFailed ? (
            <Link
              to={ordersHref}
              className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Danh sách đơn hàng
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span>{label}</span>
      <span className="max-w-[60%] break-words text-right font-medium text-slate-950">{value}</span>
    </div>
  );
}
