// hooks/useOrderDetail.ts
import { useMemo } from "react";

export const useOrderDetail = (order) => {
  const total = useMemo(() => {
    return order.items.reduce((acc, i) => acc + i.price, 0);
  }, [order]);

  return {
    total
  };
};