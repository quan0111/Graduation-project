
import React from "react";
import { Trash2 } from "lucide-react";
import { QuantityControl } from "./quantityControl";

type CartItemType = {
  id: string;
  name: string;
  image: string;
  variant?: string;
  price: number;
  quantity: number;
};

type CartItemProps = {
  item: CartItemType;
  selected: boolean;
  onSelect: (id: string) => void;
  onQty: (id: string, value: number) => void;
  onRemove: (id: string) => void;
};

export const CartItem: React.FC<CartItemProps> = ({
  item,
  selected,
  onSelect,
  onQty,
  onRemove,
}) => {
  return (
    <div className="flex gap-4 p-4 hover:bg-muted transition rounded-lg">
      
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(item.id)}
      />

      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 rounded object-cover"
      />

      <div className="flex-1">
        <p className="line-clamp-2 text-sm font-medium">{item.name}</p>

        {item.variant && (
          <p className="text-xs text-muted">{item.variant}</p>
        )}

        <p className="text-red-500 font-bold mt-1">
          {item.price.toLocaleString("vi-VN")}đ
        </p>
      </div>

      <QuantityControl
        value={item.quantity}
        onChange={(v) => onQty(item.id, v)}
      />

      <button
        onClick={() => onRemove(item.id)}
        className="p-1 hover:bg-red-100 rounded"
      >
        <Trash2 className="text-red-500" />
      </button>
    </div>
  );
};