import type { OrderStatusType } from "@/constant";

import { getStatusMeta } from "../utils/order";

type OrderFilterType = "ALL" | OrderStatusType;

interface OrdersFilterTabsProps {
  filter: OrderFilterType;
  setFilter: (value: OrderFilterType) => void;
}

const tabs: { label: string; value: OrderFilterType }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: getStatusMeta("pending").label, value: "pending" },
  { label: getStatusMeta("processing").label, value: "processing" },
  { label: getStatusMeta("shipped").label, value: "shipped" },
  { label: getStatusMeta("delivered").label, value: "delivered" },
  { label: getStatusMeta("cancelled").label, value: "cancelled" },
];

export const OrdersFilterTabs: React.FC<OrdersFilterTabsProps> = ({
  filter,
  setFilter,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => setFilter(tab.value)}
          className={[
            "rounded-full px-4 py-2 text-sm font-medium transition",
            filter === tab.value
              ? "bg-[#ee4d2d] text-white shadow-sm"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
