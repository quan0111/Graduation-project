// blocks/CartItem.tsx
import { Trash2 } from "lucide-react";
import { QuantityControl } from "./QuantityControl";

export const CartItem = ({
  item,
  selected,
  onSelect,
  onQty,
  onRemove
}) => {
  return (
    <div className="flex gap-4 p-4 hover:bg-muted transition rounded-lg">

      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(item.id)}
      />

      <img src={item.image} className="w-16 h-16 rounded" />

      <div className="flex-1">
        <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted">{item.variant}</p>

        <p className="text-red-500 font-bold mt-1">
          {item.price.toLocaleString()}đ
        </p>
      </div>

      <QuantityControl
        value={item.quantity}
        onChange={(v) => onQty(item.id, v)}
      />

      <button onClick={() => onRemove(item.id)}>
        <Trash2 className="text-red-500" />
      </button>

    </div>
  );
};