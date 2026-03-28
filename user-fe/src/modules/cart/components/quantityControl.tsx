// blocks/QuantityControl.tsx
import { Minus, Plus } from "lucide-react";

export const QuantityControl = ({ value, onChange }) => {
  return (
    <div className="flex border rounded-lg overflow-hidden">
      <button onClick={() => onChange(value - 1)}>
        <Minus size={14} />
      </button>
      <span className="px-3">{value}</span>
      <button onClick={() => onChange(value + 1)}>
        <Plus size={14} />
      </button>
    </div>
  );
};