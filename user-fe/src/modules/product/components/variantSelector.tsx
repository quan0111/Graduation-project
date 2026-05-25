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
          const isSoldOut = Number(variant.stock || 0) <= 0;
          const thumbnail = variant.variantImages?.[0]?.url ?? variant.images?.[0]?.url;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                if (!isSoldOut) {
                  onSelect(variant);
                }
              }}
              disabled={isSoldOut}
              className={`relative flex min-w-30 items-center gap-2 overflow-hidden border px-3 py-2 text-sm transition ${
                isSoldOut
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-70"
                  : active
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
              {isSoldOut && (
                <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                  Hết hàng
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
