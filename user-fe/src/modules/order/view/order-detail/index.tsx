import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import { useGetOrderById } from "../../api/get-order";
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

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Đang tải hóa đơn...</div>;
  }

  if (isError || !order) {
    return <div className="p-6 text-sm text-rose-500">Không tìm thấy hóa đơn.</div>;
  }

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
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200/80">
              <OrderHeader order={order} expanded />
            </div>

            <OrderTimeline status={order.status} />
            <OrderShipping order={order} />

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="mb-5">
                <p className="text-lg font-semibold text-slate-950">Sản phẩm trong đơn</p>
                <p className="text-sm text-slate-500">Thông tin hiển thị đúng theo hóa đơn của tài khoản hiện tại.</p>
              </div>
              <OrderItems items={order.items} />
            </div>
          </section>

          <aside className="space-y-6">
            <OrderSummary order={order} />

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <p className="mb-4 text-base font-semibold text-slate-950">Tác vụ</p>
              <OrderActions order={order} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
