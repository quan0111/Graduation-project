// blocks/QuantityControl.tsx

import React from "react";
import { Loader2, Minus, Plus } from "lucide-react";

type QuantityControlProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  isSyncing?: boolean;
};

export const QuantityControl: React.FC<QuantityControlProps> = ({
  value,
  onChange,
  min = 1,
  max = Infinity,
  isSyncing = false,
}) => {
  const canDecrease = value > min;
  const canIncrease = value < max;

  const decrease = () => {
    if (canDecrease) onChange(value - 1);
  };

  const increase = () => {
    if (canIncrease) onChange(value + 1);
  };

  return (
    <div className="inline-flex h-11 min-w-[132px] items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
      <button
        type="button"
        aria-label="Giảm số lượng"
        onClick={decrease}
        disabled={!canDecrease}
        className="grid size-11 place-items-center text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        <Minus className="size-4" />
      </button>

      <span className="relative grid min-w-10 place-items-center text-sm font-semibold tabular-nums text-slate-950">
        {value}
        {isSyncing ? (
          <Loader2 className="absolute -right-1 top-1 size-3 animate-spin text-[#ee4d2d]" />
        ) : null}
      </span>

      <button
        type="button"
        aria-label="Tăng số lượng"
        onClick={increase}
        disabled={!canIncrease}
        className="grid size-11 place-items-center text-[#ee4d2d] transition hover:bg-orange-50 active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
};
