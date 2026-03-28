// OrdersContainer.tsx
import { useState } from "react";

export const OrdersContainer = ({ orders }) => {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <>
      <OrderFilterTabs selected={filter} onChange={setFilter} />

      {filtered.map(o => (
        <OrderCard
          key={o.id}
          order={o}
          expanded={expanded === o.id}
          onToggle={(id) =>
            setExpanded(expanded === id ? null : id)
          }
        />
      ))}
    </>
  );
};