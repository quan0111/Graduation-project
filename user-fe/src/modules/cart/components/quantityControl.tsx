// blocks/QuantityControl.tsx

import React from "react";
import { Minus, Plus } from "lucide-react";

type QuantityControlProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export const QuantityControl: React.FC<QuantityControlProps> = ({
  value,
  onChange,
  min = 1,
  max = Infinity,
}) => {
  const decrease = () => {
    if (value > min) onChange(value - 1);
  };

  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex border rounded-lg overflow-hidden">
      <button
        onClick={decrease}
        disabled={value <= min}
        className="px-2 disabled:opacity-50"
      >
        <Minus size={14} />
      </button>

      <span className="px-3 flex items-center">{value}</span>

      <button
        onClick={increase}
        disabled={value >= max}
        className="px-2 disabled:opacity-50"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};