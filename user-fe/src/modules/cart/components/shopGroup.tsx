// blocks/ShopGroup.tsx

import React from "react";
import { CartItem } from "./cartItem";
type CartItemType = {
  id: string;
  name: string;
  image: string;
  variant?: string;
  price: number;
  quantity: number;
};

type ShopGroupProps = {
  shopName: string;
  items: CartItemType[];
  selected: string[]; // list id được chọn
  onSelect: (id: string) => void;
  onQty: (id: string, value: number) => void;
  onRemove: (id: string) => void;
};

export const ShopGroup: React.FC<ShopGroupProps> = ({
  shopName,
  items,
  selected,
  onSelect,
  onQty,
  onRemove,
}) => {
  return (
    <div className="bg-white rounded-lg mb-4">
      <div className="p-3 bg-muted font-medium">
        {shopName}
      </div>

      {items.map((item: CartItemType) => (
        <CartItem
          key={item.id}
          item={item}
          selected={selected.includes(item.id)}
          onSelect={onSelect}
          onQty={onQty}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};