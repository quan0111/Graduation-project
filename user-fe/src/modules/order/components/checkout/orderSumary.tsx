// OrderSummary.tsx
export const OrderSummary = ({ items, total, subtotal, tax, shipping }) => {
  return (
    <div className="sticky top-20 space-y-4">

      {/* items */}
      <div className="max-h-60 overflow-y-auto">
        {items.map(i => (
          <div key={i.id} className="flex gap-2 mb-3">
            <img src={i.image} className="w-12 h-12"/>
            <div>
              <p className="text-sm">{i.name}</p>
              <p className="text-xs">x{i.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* total */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{subtotal}</span>
        </div>

        <div className="flex justify-between font-bold">
          <span>Tổng</span>
          <span>{total}</span>
        </div>
      </div>

    </div>
  );
};