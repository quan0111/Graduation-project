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
  stock?: number;
};

type CartItemProps = {
  item: CartItemType;
  selected: boolean;
  onSelect: (id: string) => void;
  onQty: (id: string, value: number) => void;
  onRemove: (id: string) => void;
  isSyncing?: boolean;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const CartItem: React.FC<CartItemProps> = ({
  item,
  selected,
  onSelect,
  onQty,
  onRemove,
  isSyncing = false,
}) => {
  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-4 transition hover:border-orange-200 hover:bg-orange-50/40 md:grid-cols-[auto_88px_minmax(0,1fr)_auto_auto] md:items-center">
      <label className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item.id)}
          className="size-4 rounded border-slate-300 text-[#ee4d2d] focus:ring-[#ee4d2d]"
        />
      </label>

      <img
        src={item.image || "/placeholder.png"}
        alt={item.name}
        className="size-[88px] rounded-[1.25rem] object-cover ring-1 ring-slate-200"
      />

      <div className="min-w-0">
        <p className="line-clamp-2 text-base font-semibold text-slate-950">{item.name}</p>
        <p className="mt-1 text-sm text-slate-500">{item.variant || "Phân loại mặc định"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-lg font-semibold text-[#ee4d2d]">{formatCurrency(item.price)}</span>
          <span className="text-sm text-slate-400">
            Thành tiền {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>

      <QuantityControl
        value={item.quantity}
        max={item.stock ?? Infinity}
        isSyncing={isSyncing}
        onChange={(value) => onQty(item.id, value)}
      />

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="inline-flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
};
