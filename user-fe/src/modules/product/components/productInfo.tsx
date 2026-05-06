// components/productInfo.tsx

import { Star } from "lucide-react";
import type { IProduct } from "@/modules/product/types";

export const ProductInfo = ({
  product,
}: {
  product: IProduct;
}) => {

  const reviews = product.reviews ?? [];

  const rating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, r) => sum + (r.rating ?? 0),
          0
        ) / reviews.length
      : 0;

  return (
    <>

      <h1 className="text-[24px] leading-relaxed font-medium">
        {product.name}
      </h1>

      <div className="flex items-center gap-6 mt-4 text-[15px]">

        <div className="flex items-center gap-2">

          <span className="text-[#ee4d2d]">
            {rating.toFixed(1)}
          </span>

          <div className="flex">
            {[1,2,3,4,5].map((i) => (
              <Star
                key={i}
                size={14}
                className="fill-[#ee4d2d] text-[#ee4d2d]"
              />
            ))}
          </div>

        </div>

        <div className="border-l pl-5">
          {reviews.length} Đánh Giá
        </div>

        <div className="border-l pl-5">
          {/* Đã bán {product.sold || 0} */}
        </div>

      </div>

    </>
  );
};