// components/product-detail/ProductVariants.tsx
import type { IProductVariant } from "../types";

export const ProductVariants = ({
  variants,
  selected,
  onSelect,
}: {
  variants?: IProductVariant[];
  selected: IProductVariant | null;
  onSelect: (v: IProductVariant) => void;
}) => {
  if (!variants?.length) return null;

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Phiên bản</h3>

      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = selected?.id === v.id;

          return (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              className={`px-4 py-2 border rounded-lg text-sm transition
                ${active ? "border-primary bg-primary/10" : "hover:border-primary"}
              `}
            >
              {v.name}
            </button>
          );
        })}
      </div>

      {/* Stock */}
      <p className="text-sm text-muted mt-2">
        Còn lại: {selected?.stock || 0}
      </p>
    </div>
  );
};