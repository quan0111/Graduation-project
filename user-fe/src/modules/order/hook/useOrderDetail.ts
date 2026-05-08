import { useMemo } from "react";
import type { IOrderItem } from "../types";

export const useOrderDetail = (
  order: {
    items: IOrderItem[];
    shipping_fee?: number;
    discount_amount?: number;
    total_amount?: number;
  }
) => {

  /* subtotal */
  const subtotal = useMemo(() => {
    return order.items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
  }, [order.items]);

  /* shipping */
  const shipping = Number(order.shipping_fee || 0);

  /* discount */
  const discount = Number(order.discount_amount || 0);

  /* VAT */
  const tax = useMemo(() => {
    return Math.max(
      Number(order.total_amount || 0) -
        subtotal -
        shipping +
        discount,
      0
    );
  }, [
    order.total_amount,
    subtotal,
    shipping,
    discount,
  ]);

  /* total */
  const total = Number(order.total_amount || 0);

  return {
    subtotal,
    shipping,
    discount,
    tax,
    total,
  };
};