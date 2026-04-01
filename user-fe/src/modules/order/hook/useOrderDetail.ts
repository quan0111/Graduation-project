// hooks/useOrderDetail.ts
import { useMemo } from "react";
import type { IOrderItem } from "../types";
export const useOrderDetail = (order: { items: IOrderItem[] }) => {
  const total = useMemo(() => {
    return order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  }, [order]);
  return { total };
}