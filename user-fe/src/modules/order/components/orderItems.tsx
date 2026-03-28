// sections/OrderItems.tsx
export const OrderItems = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map(i => (
        <div key={i.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted transition">

          <img src={i.image} className="w-16 h-16 rounded object-cover"/>

          <div className="flex-1">
            <p className="font-medium">{i.name}</p>
            <p className="text-sm text-muted">{i.vendor}</p>

            <div className="flex justify-between mt-2">
              <span>SL: {i.quantity}</span>
              <span className="text-primary font-semibold">
                {i.price.toLocaleString()}đ
              </span>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};