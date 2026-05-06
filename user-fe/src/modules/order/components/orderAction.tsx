'use client';

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

  const { data: cartData } = useCart();

  /* ---------- CANCEL ---------- */
  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn?")) return;

    try {
      await cancelMutation.mutateAsync({
        orderId: order.id,
        reason: "Khách muốn hủy",
      });

      toast.success("Đã hủy đơn hàng");
    } catch {
      toast.error("Hủy đơn thất bại");
    }
  };

  /* ---------- REBUY ---------- */
  const handleRebuy = async () => {
    if (!order.Items?.length) {
      toast.error("Không có sản phẩm");
      return;
    }

    try {
      await Promise.all(
        order.Items.map((item) => {
          if (!item.Product?.id || !item.shop?.id) {
            throw new Error("Invalid order item");
          }

          return addCartMutation.mutateAsync({
            productId: item.Product.id,
            variantId: item.variant?.id ?? null,
            shopId: item.shop.id,
            quantity: item.quantity,
          });
        })
      );

      toast.success("Đã thêm lại vào giỏ");
      navigate("/cart");
    } catch (err) {
      console.error(err);
      toast.error("Mua lại thất bại");
    }
  };

  const canCancel = order.status === "pending";
  const canRebuy = order.status !== "cancelled";

  return (
    <div className="grid md:grid-cols-3 gap-3">
      <Button variant="outline" onClick={() => window.print()}>
        Tải hóa đơn
      </Button>

      <Button variant="outline">
        Liên hệ
      </Button>

      {canCancel ? (
        <Button
          variant="destructive"
          onClick={handleCancel}
        >
          Hủy đơn
        </Button>
      ) : (
        canRebuy && (
          <Button
            className="bg-accent"
            onClick={handleRebuy}
          >
            Mua lại
          </Button>
        )
      )}
    </div>
  );
};