// OrdersFilterTabs.tsx
export const OrdersFilterTabs = ({ filter, setFilter }) => {
  const tabs = [
    { label: "Tất cả", value: "all" },
    { label: "Đang xử lý", value: "processing" },
    { label: "Đang giao", value: "shipping" },
    { label: "Đã giao", value: "delivered" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map(t => (
        <button
          key={t.value}
          onClick={() => setFilter(t.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition
            ${filter === t.value
              ? "bg-primary text-white shadow"
              : "bg-muted hover:bg-muted/70"}
          `}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};