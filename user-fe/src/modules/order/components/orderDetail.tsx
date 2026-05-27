import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";

import { OrderActions } from "./orderAction";
import { OrderItems } from "./orderItems";
import { OrderPackageSummary } from "./packageSummary";
import type { IOrder } from "../types";
import { formatCurrency } from "../utils/order";

interface OrderDetailsProps {
  order: IOrder;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  return (
    <div className="space-y-5 border-t border-slate-100 bg-slate-50/80 p-6">
      <OrderItems items={order.items} />
      <OrderPackageSummary order={order} />

      <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Thanh toán</p>
          <p className="text-lg font-semibold text-slate-950">{formatCurrency(order.total_amount)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={`/orders/${order.id}`} className={buttonVariants()}>
            Mở hóa đơn
          </Link>
          <OrderActions order={order} />
        </div>
      </div>
    </div>
  );
};
