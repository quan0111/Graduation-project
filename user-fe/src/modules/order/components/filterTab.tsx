import type { OrderStatusType } from "@/constant";

type OrderFilterType = "ALL" | OrderStatusType;

interface OrdersFilterTabsProps {
  filter: OrderFilterType;
  setFilter: (value: OrderFilterType) => void;
}

const tabs: { label: string; value: OrderFilterType }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Đang xử lý", value: "processing" },
  { label: "Đang giao", value: "shipped" },
  { label: "Đã giao", value: "delivered" },
];

export const OrdersFilterTabs: React.FC<OrdersFilterTabsProps> = ({
  filter,
  setFilter,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => setFilter(t.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition
            ${
              filter === t.value
                ? "bg-primary text-white shadow"
                : "bg-muted hover:bg-muted/70"
            }
          `}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};