// components/price.tsx

interface ProductPriceProps {
  price?: number;
  originalPrice?: number;
}

export const ProductPrice = ({
  price = 0,
  originalPrice,
}: ProductPriceProps) => {

  const format = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v);

  const hasDiscount =
    originalPrice &&
    originalPrice > price;

  const discount = hasDiscount
    ? Math.round(
        (1 - price / originalPrice) * 100
      )
    : 0;

  return (
    <div className="bg-[#fafafa] mt-6 p-5">

      <div className="flex items-center gap-4 flex-wrap">

        {hasDiscount && (
          <span className="text-[20px] text-gray-400 line-through">
            ₫{format(originalPrice!)}
          </span>
        )}

        <span className="text-[34px] text-[#ee4d2d]">
          ₫{format(price)}
        </span>

        {hasDiscount && (
          <div className="bg-[#ee4d2d] text-white px-2 py-1 text-sm">
            -{discount}%
          </div>
        )}

      </div>

    </div>
  );
};