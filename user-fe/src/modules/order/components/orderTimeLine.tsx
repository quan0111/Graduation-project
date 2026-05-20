import { CheckCircle2, Circle, Clock } from "lucide-react";

import type { IOrder } from "../types";
import { formatDateTime, getTrackingSteps } from "../utils/order";

interface OrderTimelineProps {
  status: IOrder["status"];
  order?: IOrder;
}

const stepDescriptions: Record<string, string> = {
  pending: "Đơn hàng đã được tạo",
  pending_payment: "Khách đang thanh toán online",
  paid: "Đơn hàng đã thanh toán thành công",
  confirmed: "Seller đã xác nhận đơn hàng",
  processing: "Seller đang chuẩn bị và đóng gói",
  ready_to_ship: "Đơn đã sẵn sàng bàn giao vận chuyển",
  shipped: "Seller đã bàn giao cho đơn vị vận chuyển",
  in_transit: "Đơn hàng đang trên đường vận chuyển",
  out_for_delivery: "Đơn vị vận chuyển đang giao đến khách",
  delivered: "Đơn hàng đã giao đến địa chỉ nhận",
  completed: "Đơn hàng đã hoàn tất",
  payment_failed: "Thanh toán không thành công",
  payment_expired: "Phiên thanh toán đã hết hạn",
  cancel_requested: "Khách đã gửi yêu cầu hủy",
  cancel_rejected: "Yêu cầu hủy bị từ chối",
  cancel_approved: "Yêu cầu hủy đã được duyệt",
  cancelled_by_customer: "Đơn đã bị hủy bởi khách",
  cancelled_by_seller: "Đơn đã bị hủy bởi seller",
  cancelled: "Đơn hàng đã hủy",
  delivery_failed: "Giao hàng thất bại",
  return_to_sender: "Đơn đang hoàn về kho hoặc seller",
  return_requested: "Khách đã gửi yêu cầu trả hàng",
  returned: "Đơn đã hoàn trả",
};

const getStepTime = (stepKey: IOrder["status"], order: IOrder, isCurrent: boolean) => {
  const trackingSource = order.shipment ?? order.shop_package ?? order.packages?.[0] ?? null;

  if (stepKey === "pending") return order.created_at;
  if (stepKey === "pending_payment") return order.payment?.created_at ?? (isCurrent ? order.updated_at : null);
  if (stepKey === "paid") return order.payment?.paid_at ?? (isCurrent ? order.updated_at : null);
  if (stepKey === "shipped") return trackingSource?.shipped_at ?? (isCurrent ? order.updated_at : null);
  if (stepKey === "delivered") return trackingSource?.delivered_at ?? (isCurrent ? order.updated_at : null);
  if (isCurrent) return order.updated_at;

  return null;
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, order }) => {
  const hasOnlinePayment = Boolean(order?.payment && order.payment.method !== "COD");
  const steps = getTrackingSteps(status, hasOnlinePayment);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-lg font-semibold text-slate-900">Theo dõi đơn hàng</p>
        <p className="mt-1 text-sm text-slate-500">
          Tracking nội bộ theo trạng thái seller, kho, vận chuyển và hoàn trả
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCurrent = step.key === status;
          const isDone = step.active && !isCurrent;
          const description = stepDescriptions[step.key] || step.label;
          const stepTime = order ? getStepTime(step.key, order, isCurrent) : null;

          return (
            <div key={step.key} className="relative">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      "flex size-10 items-center justify-center rounded-full ring-2",
                      step.active
                        ? "bg-[#ee4d2d] text-white ring-[#ee4d2d]"
                        : "bg-slate-100 text-slate-400 ring-slate-200",
                      isCurrent ? "ring-offset-2" : "",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-5" />
                    ) : isCurrent ? (
                      <Clock className="size-5" />
                    ) : (
                      <Circle className="size-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={[
                        "mt-2 w-0.5 flex-1",
                        isDone ? "bg-[#ee4d2d]" : "bg-slate-200",
                      ].join(" ")}
                    />
                  )}
                </div>

                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={[
                          "font-semibold",
                          step.active ? "text-slate-900" : "text-slate-500",
                        ].join(" ")}
                      >
                        {step.label}
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm",
                          step.active ? "text-slate-600" : "text-slate-400",
                        ].join(" ")}
                      >
                        {description}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-[#ee4d2d] px-3 py-1 text-xs font-medium text-white">
                        Hiện tại
                      </span>
                    )}
                  </div>

                  {step.active && stepTime && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="size-3" />
                      <span>{formatDateTime(stepTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
