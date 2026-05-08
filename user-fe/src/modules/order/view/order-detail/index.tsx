import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, RotateCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ReturnRequestForm } from "@/modules/return-request/components/returnRequestForm";
import { ShipmentTracking } from "@/modules/shipment/components/shipmentTracking";
import { useShipmentByOrder } from "@/modules/shipment/api/get-shipment";

import { useGetOrderById } from "../../api/get-order";
import { useUpdateOrder } from "../../api/update-order";
import { CancelOrderModal } from "../../components/CancelOrderModal";
import { OrderActions } from "../../components/orderAction";
import { OrderHeader } from "../../components/orderHeader";
import { OrderItems } from "../../components/orderItems";
import { OrderShipping } from "../../components/shipping";
import { OrderSummary } from "../../components/summary";
import { OrderTimeline } from "../../components/orderTimeLine";

export default function OrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const { data: order, isLoading, isError } = useGetOrderById(orderId, {
    enabled: !!orderId,
  });
  const { data: shipment } = useShipmentByOrder(orderId);
  const completeMutation = useUpdateOrder();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Đang tải hóa đơn...</div>;
  }

  if (isError || !order) {
    return <div className="p-6 text-sm text-rose-500">Không tìm thấy hóa đơn.</div>;
  }

  const handleCompleteOrder = async () => {
    if (!window.confirm("Xác nhận bạn đã nhận được hàng?")) return;
    await completeMutation.mutateAsync({
      id: String(order.id),
      data: { status: "completed" },
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-5">
          <Link to="/orders" className={`${buttonVariants({ variant: "outline" })} inline-flex`}>
            <ChevronLeft className="size-4" />
            Quay lại đơn hàng
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-4xl bg-white shadow-sm ring-1 ring-slate-200/80">
              <OrderHeader order={order} expanded />
            </div>

            <OrderTimeline status={order.status} order={order} />
            <OrderShipping order={order} />
            <ShipmentTracking shipment={shipment ?? null} />

            <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="mb-5">
                <p className="text-lg font-semibold text-slate-950">Sản phẩm trong đơn</p>
                <p className="text-sm text-slate-500">
                  Thông tin hiển thị đúng theo hóa đơn của tài khoản hiện tại.
                </p>
              </div>
              <OrderItems items={order.items} />
            </div>
          </section>

          <aside className="space-y-6">
            <OrderSummary order={order} />

            <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <p className="mb-4 text-base font-semibold text-slate-950">Tác vụ</p>
              <OrderActions order={order} />
              {order.status === "delivered" && (
                <Button
                  className="mt-4 w-full bg-[#ee4d2d] hover:bg-[#d93f21]"
                  onClick={handleCompleteOrder}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? "Đang xác nhận..." : "Đã nhận hàng"}
                </Button>
              )}
              {order.status === "pending" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <RotateCcw className="size-4" />
                  Hủy đơn hàng
                </button>
              )}
              {order.status === "completed" && (
                <button
                  onClick={() => setShowReturnForm(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="size-4" />
                  Yêu cầu trả hàng
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {showReturnForm && (
        <ReturnRequestForm
          orderId={orderId}
          orderItems={order.items}
          onCancel={() => setShowReturnForm(false)}
          onSuccess={() => {
            setShowReturnForm(false);
            window.location.reload();
          }}
        />
      )}

      {showCancelModal && (
        <CancelOrderModal
          orderId={orderId}
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            setShowCancelModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
