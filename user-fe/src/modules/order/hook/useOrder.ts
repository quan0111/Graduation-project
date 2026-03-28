// hooks/useOrders.ts
import { useState, useMemo } from "react";

export const useOrders = (orders) => {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => (prev === id ? null : id));
  };

  return {
    filter,
    setFilter,
    expanded,
    toggleExpand,
    orders: filtered
  };
};