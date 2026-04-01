
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
};

type GroupedCart = Record<string, CartItemType[]>;

type CartListProps = {
  grouped: GroupedCart;
  selected: string[];
  onSelect: (id: string) => void;
  onQty: (id: string, value: number) => void;
  onRemove: (id: string) => void;
};

export const CartList: React.FC<CartListProps> = ({
  grouped,
  selected,
  onSelect,
  onQty,
  onRemove,
}) => {
  return (
    <>
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
          />
        );
      })}
    </>
  );
};