import { CheckCircle2, Circle, Clock } from "lucide-react";

import type { IOrder } from "../types";
import { formatDateTime, getTrackingSteps } from "../utils/order";

interface OrderTimelineProps {
  status: IOrder["status"];
  order?: IOrder;
}

const stepDescriptions: Record<string, string> = {
  pending: "Đơn hàng đã được tạo",
  paid: "Đơn hàng đã thanh toán thành công",
  confirmed: "Shop đã xác nhận đơn hàng",
  processing: "Shop đang chuẩn bị đơn hàng",
  ready_to_ship: "Đơn đã đóng gói và chờ đơn vị vận chuyển lấy hàng",
  shipped: "Đơn hàng đã được bàn giao cho đơn vị vận chuyển",
  in_transit: "Đơn hàng đang trên đường giao đến bạn",
  delivered: "Đơn hàng đã giao đến địa chỉ nhận hàng",
  completed: "Đơn hàng đã hoàn tất thành công",
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, order }) => {
  // COD orders don't have payment record, so skip 'paid' step
  const hasPayment = !!order?.payment;
  const steps = getTrackingSteps(status, hasPayment);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-lg font-semibold text-slate-900">Theo dõi đơn hàng</p>
        <p className="mt-1 text-sm text-slate-500">Trạng thái xử lý hiện tại của đơn hàng</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCurrent = step.key === status;
          const isDone = step.active && !isCurrent;
          const description = stepDescriptions[step.key] || step.label;

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
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={[
                        "font-semibold",
                        step.active ? "text-slate-900" : "text-slate-500",
                      ].join(" ")}>
                        {step.label}
                      </p>
                      <p className={[
                        "mt-1 text-sm",
                        step.active ? "text-slate-600" : "text-slate-400",
                      ].join(" ")}>
                        {description}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="rounded-full bg-[#ee4d2d] px-3 py-1 text-xs font-medium text-white">
                        Hiện tại
                      </span>
                    )}
                  </div>

                  {step.active && order && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="size-3" />
                      <span>
                        {step.key === "pending" && order.created_at ? formatDateTime(order.created_at) : ""}
                        {step.key !== "pending" && order.updated_at ? formatDateTime(order.updated_at) : ""}
                      </span>
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
