import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCancelOrder } from "../api/cancel-order";
import { useAddItem } from "@/modules/cart/api/add-item";
import { useCart } from "@/modules/cart/api/get-cart";
import { toast } from "sonner";
import type { IOrder } from "../types";

type Props = {
  order: IOrder;
};

export const OrderActions = ({ order }: Props) => {
  const navigate = useNavigate();
  const cancelMutation = useCancelOrder();
  const addCartMutation = useAddItem();

  // 🔥 Lấy cart thật từ API (KHÔNG dùng localStorage)
  const { data: cartData } = useCart();

  const cartId = cartData?.id;

  /* ---------- CANCEL ---------- */
  const handleCancel = async () => {
    const confirmCancel = confirm("Bạn có chắc muốn hủy đơn?");
    if (!confirmCancel) return;

    try {
      await cancelMutation.mutateAsync({
        orderId: order.id,
        reason: "Khách muốn hủy",
      });

      toast.success("Đã hủy đơn hàng");
    } catch (error) {
      console.error(error);
      toast.error("Hủy đơn thất bại");
    }
  };

  /* ---------- REBUY ---------- */
  const handleRebuy = async () => {
    if (!order.Items?.length) {
      toast.error("Không có sản phẩm để mua lại");
      return;
    }

    if (!cartId) {
      toast.error("Không tìm thấy giỏ hàng");
      return;
    }

    try {
      await Promise.all(
        order.Items.map((item) =>
          addCartMutation.mutateAsync({
            cart_id: cartId,
            product_id: item.product_id,
            quantity: item.quantity,
          })
        )
      );

      toast.success("Đã thêm vào giỏ hàng");

      navigate("/cart");
    } catch (err) {
      console.error(err);
      toast.error("Mua lại thất bại");
    }
  };

  const handleContact = () => {
    toast.info("Tính năng đang phát triển 🚀");
  };

  const handleInvoice = () => {
    toast.info("Đang tải hóa đơn...");
    window.print();
  };

  /* ---------- CONDITIONS ---------- */
  const canCancel = order.status === "PENDING";
  const canRebuy = order.status !== "CANCELLED";

  /* ---------- UI ---------- */

  return (
    <div className="grid md:grid-cols-3 gap-3">
      <Button variant="outline" onClick={handleInvoice}>
        Tải hóa đơn
      </Button>

      <Button variant="outline" onClick={handleContact}>
        Liên hệ
      </Button>

      {canCancel ? (
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn"}
        </Button>
      ) : (
        canRebuy && (
          <Button
            className="bg-accent"
            onClick={handleRebuy}
            disabled={addCartMutation.isPending}
          >
            {addCartMutation.isPending ? "Đang thêm..." : "Mua lại"}
          </Button>
        )
      )}
    </div>
  );
};