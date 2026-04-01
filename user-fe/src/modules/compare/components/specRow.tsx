// blocks/SpecRow.tsx
import { Check } from "lucide-react";

interface Product {
  id: string | number;
  specs?: Record<string, string | number>;
}

interface SpecRowProps {
  spec: string;
  list: Product[];
  bestId?: string | number; // truyền từ ngoài sẽ đúng hơn
}

export const SpecRow: React.FC<SpecRowProps> = ({
  spec,
  list,
  bestId,
}) => {
  return (
    <tr className="border-b">
      {/* Spec name */}
      <td className="p-3 font-medium text-gray-700 whitespace-nowrap">
        {spec}
      </td>

      {/* Values */}
      {list.map((p) => {
        const value = p.specs?.[spec] ?? "-";
        const isBest = p.id === bestId;

        return (
          <td
            key={`${p.id}-${spec}`}
            className={`text-center p-3 transition ${
              isBest
                ? "bg-green-50 text-green-600 font-semibold"
                : "text-gray-600"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <span>{value}</span>
              {isBest && <Check size={14} />}
            </div>
          </td>
        );
      })}
    </tr>
  );
};