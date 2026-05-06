import { ChevronDown, ChevronUp, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { IOrder } from "../types";
import { formatCurrency, formatDateTime, getStatusMeta } from "../utils/order";

interface OrderHeaderProps {
  order: IOrder;
  expanded?: boolean;
  onClick?: () => void;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
  order,
  expanded = false,
  onClick,
}) => {
  const status = getStatusMeta(order.status);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-6 py-5 text-left transition hover:bg-orange-50/50"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-100 text-[#ee4d2d]">
              <ReceiptText className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Hóa đơn
              </p>
              <p className="text-lg font-semibold text-slate-950">#{order.id}</p>
            </div>
            <Badge className={`bg-transparent ring-1 ${status.chip}`}>{status.label}</Badge>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span>{formatDateTime(order.created_at)}</span>
            <span>{order.items.length} sản phẩm</span>
            <span>{order.payment?.method ?? "Chưa có thanh toán"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tổng thanh toán</p>
            <p className="text-xl font-semibold text-slate-950">{formatCurrency(order.total_amount)}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </div>
        </div>
      </div>
    </button>
  );
};
