import { useParams } from "react-router-dom";
import { OrderHeader } from "../../components/orderHeader";
import { OrderTimeline } from "../../components/orderTimeLine";
import { OrderShipping } from "../../components/shipping";
import { OrderItems } from "../../components/orderItems";
import { OrderSummary } from "../../components/summary";
import { OrderActions } from "../../components/orderAction";

import { useGetOrderById } from "../../api/get-order";

/* ---------- PAGE ---------- */

export default function OrderDetailPage() {
  const { id } = useParams();

  const orderId = Number(id);

  const { data, isLoading, isError } = useGetOrderById(orderId, {
    enabled: !!orderId,
  });

  const order = data?.data;

  /* ---------- LOADING ---------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (isError || !order) {
    return (
      <div className="text-center text-red-500">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <OrderHeader order={order} />

      <OrderTimeline status={order.status} />

      <OrderShipping order={order} />

      <OrderItems items={order.Items ?? []} />

      <OrderSummary order={order} />

      <OrderActions order={order} />
    </div>
  );
}