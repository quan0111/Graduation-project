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
      <span className="w-24 text-[#757575]">
        Phân loại
      </span>

      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const active = selected?.id === variant.id;
          const thumbnail = variant.variantImages?.[0]?.url ?? variant.images?.[0]?.url;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              className={`flex min-w-30 items-center gap-2 border px-3 py-2 text-sm ${
                active
                  ? "border-[#ee4d2d] text-[#ee4d2d]"
                  : "border-gray-300 hover:border-[#ee4d2d]"
              }`}
            >
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt={variant.name}
                  className="size-8 rounded object-cover"
                />
              )}
              <span>{variant.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
