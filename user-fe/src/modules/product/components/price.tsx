interface ProductPriceProps {
  price?: number;
  originalPrice?: number;
}

export const ProductPrice = ({ price = 0, originalPrice }: ProductPriceProps) => {
  const format = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
  const hasDiscount = Boolean(originalPrice && originalPrice > price);
  const discount = hasDiscount ? Math.round((1 - price / originalPrice!) * 100) : 0;

  return (
    <div className="mt-6 bg-[#fafafa] p-5">
      <div className="flex flex-wrap items-center gap-4">
        {hasDiscount && (
          <span className="text-[20px] text-gray-400 line-through">
            {format(originalPrice!)}đ
          </span>
        )}

        <span className="text-[34px] text-[#ee4d2d]">{format(price)}đ</span>

        {hasDiscount && (
          <div className="bg-[#ee4d2d] px-2 py-1 text-sm text-white">-{discount}%</div>
        )}
      </div>
    </div>
  );
};
