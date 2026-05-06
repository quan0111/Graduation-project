import { PackageCheck, PackageOpen, Receipt, Truck } from "lucide-react";

import type { IOrder } from "../types";
import { getTrackingSteps } from "../utils/order";

interface OrderTimelineProps {
  status: IOrder["status"];
}

const stepIcons = [
  Receipt,
  PackageOpen,
  Truck,
  PackageCheck,
  PackageCheck,
  PackageCheck,
  PackageCheck,
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const steps = getTrackingSteps(status);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-950">Theo dõi đơn hàng</p>
        <p className="text-sm text-slate-500">Trạng thái xử lý hiện tại của đơn hàng</p>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] || PackageCheck;

          return (
            <div key={step.key} className="relative">
              <div className="flex items-center gap-3 md:flex-col md:items-start">
                <div
                  className={[
                    "flex size-10 items-center justify-center rounded-2xl ring-1",
                    step.active
                      ? "bg-[#ee4d2d] text-white ring-[#ee4d2d]"
                      : "bg-slate-50 text-slate-400 ring-slate-200",
                  ].join(" ")}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.label}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={[
                    "absolute left-5 top-10 h-8 w-px md:left-10 md:top-5 md:h-px md:w-[calc(100%-1rem)]",
                    step.active ? "bg-[#ee4d2d]" : "bg-slate-200",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
