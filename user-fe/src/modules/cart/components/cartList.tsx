import React from "react";

import { ShopGroup } from "./shopGroup";

type CartItemType = {
  id: string;
  name: string;
  image: string;
  variant?: string;
  price: number;
  quantity: number;
  shopName: string;
  stock?: number;
};

type GroupedCart = Record<string, CartItemType[]>;

type CartListProps = {
  grouped: GroupedCart;
  selected: string[];
  onSelect: (id: string) => void;
  onQty: (id: string, value: number) => void;
  onRemove: (id: string) => void;
  syncingIds?: Set<string>;
};

export const CartList: React.FC<CartListProps> = ({
  grouped,
  selected,
  onSelect,
  onQty,
  onRemove,
  syncingIds = new Set(),
}) => {
  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([shopId, items]) => {
        if (!items.length) return null;

        return (
          <ShopGroup
            key={shopId}
            shopName={items[0].shopName}
            items={items}
            selected={selected}
            onSelect={onSelect}
            onQty={onQty}
            onRemove={onRemove}
            syncingIds={syncingIds}
          />
        );
      })}
    </div>
  );
};
