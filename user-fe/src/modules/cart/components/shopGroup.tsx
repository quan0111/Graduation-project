import React from "react";
import { Store } from "lucide-react";

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
  selected: string[];
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
    <section className="overflow-hidden rounded-4xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-orange-100 text-[#ee4d2d]">
          <Store className="size-4" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Cửa hàng</p>
          <p className="font-semibold text-slate-950">{shopName}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {items.map((item) => (
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
    </section>
  );
};
