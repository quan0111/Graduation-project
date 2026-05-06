// components/variantSelector.tsx

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
    <div className="flex gap-8">

      <span className="text-[#757575] w-24">
        Phân Loại
      </span>

      <div className="flex flex-wrap gap-3">

        {variants.map((v) => {
          const active =
            selected?.id === v.id;

          return (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              className={`min-w-[90px] px-5 py-2 border text-sm ${
                active
                  ? "border-[#ee4d2d] text-[#ee4d2d]"
                  : "border-gray-300 hover:border-[#ee4d2d]"
              }`}
            >
              {v.name}
            </button>
          );
        })}

      </div>

    </div>
  );
};