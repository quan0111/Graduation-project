import { useState, useMemo } from "react";
import type { IOrder, OrderStatusType } from "../types";


export type OrderFilterType = "ALL" | OrderStatusType;


export const useOrders = (orders: IOrder[]) => {
  const [filter, setFilter] = useState<OrderFilterType>("ALL");

  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const filtered = useMemo(() => {
    if (filter === "ALL") return orders;

    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  return {
    filter,
    setFilter,
    expanded,
    toggleExpand,
    orders: filtered,
  };
};