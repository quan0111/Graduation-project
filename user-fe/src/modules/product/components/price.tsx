// ProductPrice.tsx

interface ProductPriceProps {
  price?: number;
  originalPrice?: number;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({
  price = 0,
  originalPrice,
}) => {
  const hasDiscount =
    originalPrice && originalPrice > price && originalPrice > 0;

  const discount = hasDiscount
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  const format = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);

  return (
    <div className="bg-muted p-4 rounded-xl mb-6">
      <div className="flex flex-wrap gap-3 items-center">

        {/* Price */}
        <span className="text-3xl font-bold text-primary">
          {format(price)}đ
        </span>

        {/* Original price */}
        {hasDiscount && (
          <span className="line-through text-gray-400">
            {format(originalPrice!)}đ
          </span>
        )}

        {/* Discount */}
        {hasDiscount && discount > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
            -{discount}%
          </span>
        )}

      </div>
    </div>
  );
};