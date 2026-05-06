import { useState } from "react";
import type { IOrder } from "../types";

import { OrdersFilterTabs } from "./filterTab";
import { OrderCard } from "./orderCard";

type OrderFilterType = "ALL" | IOrder["status"];

type Props = {
  orders: IOrder[];
};

export const OrdersContainer: React.FC<Props> = ({ orders }) => {
  const [filter, setFilter] = useState<OrderFilterType>("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered =
    filter === "ALL"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <>
      <OrdersFilterTabs
        filter={filter}
        setFilter={(value) => setFilter(value as OrderFilterType)}
      />

      {filtered.map((o) => (
        <OrderCard
          key={o.id}
          order={o}
          expanded={expanded === o.id}
          onToggle={() =>
            setExpanded(expanded === o.id ? null : o.id)
          }
        />
      ))}
    </>
  );
};