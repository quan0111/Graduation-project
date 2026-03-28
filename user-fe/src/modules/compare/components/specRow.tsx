// blocks/SpecRow.tsx
import { Check } from "lucide-react";

export const SpecRow = ({ spec, list }) => {
  const bestId = list[0]?.id;

  return (
    <tr>
      <td className="p-3 font-medium">{spec}</td>

      {list.map(p => {
        const value = p.specs[spec] || "-";
        const isBest = p.id === bestId;

        return (
          <td
            key={p.id}
            className={`text-center p-3 ${
              isBest ? "bg-green-50 text-green-600 font-bold" : ""
            }`}
          >
            {value}
            {isBest && <Check size={12}/>}
          </td>
        );
      })}
    </tr>
  );
};