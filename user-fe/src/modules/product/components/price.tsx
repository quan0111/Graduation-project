// ProductPrice.tsx
export const ProductPrice = ({ price, originalPrice }) => {
  const discount = Math.round((1 - price / originalPrice) * 100);

  return (
    <div className="bg-muted p-4 rounded mb-6">
      <div className="flex gap-3 items-center">
        <span className="text-3xl font-bold text-primary">
          {price.toLocaleString()}đ
        </span>

        <span className="line-through">
          {originalPrice.toLocaleString()}đ
        </span>

        <span className="bg-red-500 text-white px-2 py-1 rounded">
          -{discount}%
        </span>
      </div>
    </div>
  );
};