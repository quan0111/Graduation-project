// ProductInfo.tsx
import { Star } from "lucide-react";

export const ProductInfo = ({ product }) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={i < product.rating ? "text-yellow-400" : ""}/>
          ))}
          <span>{product.rating}</span>
        </div>

        <span>{product.reviews} đánh giá</span>
        <span>Đã bán {product.sold}</span>
      </div>
    </>
  );
};