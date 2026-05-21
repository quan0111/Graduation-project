import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useRetryPayment, type RetryPaymentResponse } from "@/modules/order/api/retry-payment";
import type { IPayment } from "@/modules/order/types";

interface PaymentRetryPanelProps {
  orderId: number;
  payment?: IPayment | null;
}

const GATEWAY_METHODS = new Set(["MOMO", "VNPAY"]);
const SUCCESS_STATUSES = new Set(["SUCCESS", "PAYMENT_SUCCESS", "success", "payment_success"]);
const FAILED_STATUSES = new Set(["FAILED", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "failed", "payment_failed", "payment_expired"]);
const POLL_INTERVAL_MS = 5000;

const normalizeStatus = (status?: string | null) => String(status ?? "").toUpperCase();

const canRetry = (status?: string | null) => FAILED_STATUSES.has(status ?? "") || FAILED_STATUSES.has(normalizeStatus(status));

export function PaymentRetryPanel({ orderId, payment }: PaymentRetryPanelProps) {
  const queryClient = useQueryClient();
  const pollingRef = useRef(false);
  const [gateway, setGateway] = useState<RetryPaymentResponse | null>(null);
  const [message, setMessage] = useState("Hệ thống sẽ tự kiểm tra trạng thái thanh toán.");
  const [isChecking, setIsChecking] = useState(false);
  const retryMutation = useRetryPayment({
    onSuccess: async (response) => {
      setGateway(response);
      setMessage("Mã QR mới đã sẵn sàng. Hệ thống đang tự kiểm tra thanh toán.");
      toast.success("Đã tạo lại mã QR thanh toán");
      await queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] });
    },
    onError: () => toast.error("Không thể tạo lại thanh toán"),
  });

  const method = payment?.method?.toUpperCase();
  const status = payment?.status ?? "";
  const paymentId = payment?.id ?? 0;
  const normalizedStatus = normalizeStatus(status);
  const isSuccess = SUCCESS_STATUSES.has(status) || SUCCESS_STATUSES.has(normalizedStatus);
  const shouldShow = Boolean(paymentId && method && GATEWAY_METHODS.has(method) && !isSuccess);
  const qrCodeUrl = gateway?.qrCodeUrl || payment?.qr_code_url || null;
  const paymentUrl = gateway?.paymentUrl || payment?.payment_url || null;
  const deeplink = gateway?.deeplink || payment?.deeplink || null;

  const syncPaymentStatus = useCallback(async () => {
    if (!paymentId || pollingRef.current) {
      return;
    }

    pollingRef.current = true;
    setIsChecking(true);
    try {
      const response = await apiClient.get(`${API_URL_ORDER}/payment/order/${orderId}`);
      const nextPayment = response.data?.data ?? response.data;
      const nextStatus = normalizeStatus(nextPayment?.status);

      if (SUCCESS_STATUSES.has(nextStatus)) {
        setMessage("Thanh toán đã được xác nhận thành công.");
        await queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] });
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        return;
      }

      if (FAILED_STATUSES.has(nextStatus)) {
        setMessage("Thanh toán chưa thành công hoặc đã hết hạn. Bạn có thể tạo lại mã QR.");
        await queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] });
        return;
      }

      setMessage("Đang chờ cổng thanh toán gửi xác nhận về hệ thống.");
    } catch {
      setMessage("Chưa kiểm tra được trạng thái. Hệ thống sẽ thử lại tự động.");
    } finally {
      setIsChecking(false);
      pollingRef.current = false;
    }
  }, [orderId, paymentId, queryClient]);

  useEffect(() => {
    if (!shouldShow || !qrCodeUrl) {
      return;
    }

    const firstCheck = window.setTimeout(() => {
      syncPaymentStatus();
    }, 1200);
    const interval = window.setInterval(() => {
      syncPaymentStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(firstCheck);
      window.clearInterval(interval);
    };
  }, [qrCodeUrl, shouldShow, syncPaymentStatus]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950">Thanh toán {method}</p>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        {isChecking ? (
          <RefreshCw className="size-5 animate-spin text-orange-500" />
        ) : (
          <CheckCircle2 className="size-5 text-slate-300" />
        )}
      </div>

      {qrCodeUrl ? (
        <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <img src={qrCodeUrl} alt={`${method} QR Code`} className="h-40 w-full rounded-2xl bg-white object-contain p-2" />
          </div>
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-600">
              Mở app {method}, quét mã QR và giữ trang này mở. Sau khi cổng thanh toán gửi callback, đơn hàng sẽ tự cập nhật.
            </p>
            <div className="flex flex-wrap gap-2">
              {paymentUrl ? (
                <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="size-4" />
                    Mở trang thanh toán
                  </Button>
                </a>
              ) : null}
              {deeplink ? (
                <a href={deeplink}>
                  <Button variant="outline" className="gap-2">
                    <Smartphone className="size-4" />
                    Mở app {method}
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {canRetry(status) ? (
        <Button
          className="mt-4 w-full bg-[#ee4d2d] hover:bg-[#d93f21]"
          onClick={() => retryMutation.mutate(paymentId)}
          disabled={retryMutation.isPending}
        >
          {retryMutation.isPending ? "Đang tạo lại QR..." : "Tạo lại mã QR thanh toán"}
        </Button>
      ) : null}
    </div>
  );
}
