import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAddItem } from "@/modules/cart/api/add-item";

import { useCancelOrder } from "../api/cancel-order";
import type { IOrder } from "../types";

type Props = {
  order: IOrder;
};

export const OrderActions = ({ order }: Props) => {
  const navigate = useNavigate();
  const cancelMutation = useCancelOrder();
  const addCartMutation = useAddItem();

  const handleCancel = async () => {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn này?")) return;

    try {
      await cancelMutation.mutateAsync({
        orderId: order.id,
        reason: "Khách yêu cầu hủy đơn",
      });

      toast.success("Đơn hàng đã được hủy");
    } catch {
      toast.error("Không thể hủy đơn hàng");
    }
  };

  const handleRebuy = async () => {
    if (!order.items.length) {
      toast.error("Không có sản phẩm để mua lại");
      return;
    }

    try {
      await Promise.all(
        order.items.map((item) =>
          addCartMutation.mutateAsync({
            productId: item.product_id,
            variantId: item.variant_id ?? null,
            shopId: item.shop_id,
            quantity: item.quantity,
          }),
        ),
      );

      toast.success("Đã thêm lại sản phẩm vào giỏ");
      navigate("/cart");
    } catch {
      toast.error("Không thể thêm lại sản phẩm");
    }
  };

  const canCancel = ["pending", "pending_payment", "paid", "confirmed", "payment_failed", "payment_expired"].includes(order.status);
  const canRebuy = !["cancelled", "cancelled_by_customer", "cancelled_by_seller"].includes(order.status);

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => window.print()}>
        In hóa đơn
      </Button>
      <Button variant="outline" onClick={() => navigate(`/orders/${order.id}`)}>
        Xem chi tiết
      </Button>
      {canCancel ? (
        <Button variant="destructive" onClick={handleCancel}>
          Hủy đơn
        </Button>
      ) : null}
      {canRebuy ? (
        <Button className="bg-[#ee4d2d] hover:bg-[#d93f21]" onClick={handleRebuy}>
          Mua lại
        </Button>
      ) : null}
    </div>
  );
};
