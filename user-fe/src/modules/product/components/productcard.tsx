// components/products/ProductCard.tsx
import type { IProduct } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const getAvgRating = (reviews?: any[]) => {
  if (!reviews?.length) return 0;
  return (
    reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
    reviews.length
  );
};

export const ProductCard = ({ product }: { product: IProduct }) => {
  const avgRating = getAvgRating(product.Review);

  return (
    <Card className="group hover:shadow-xl transition">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.image || product.Images?.[0]?.url}
          className="w-full h-full object-cover group-hover:scale-110 transition"
        />
      </div>

      <CardContent>
        <p className="text-xs text-muted">
          {product.Shop?.name || "Unknown shop"}
        </p>

        <h3 className="line-clamp-2 font-semibold">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="text-sm text-yellow-500">
          ⭐ {avgRating.toFixed(1)} ({product.Review?.length || 0})
        </div>

        {/* Price */}
        <div className="flex gap-2">
          <span className="text-primary font-bold">
            {product.price.toLocaleString()}đ
          </span>
        </div>

        <Button className="w-full mt-2">Thêm</Button>
      </CardContent>
    </Card>
  );
};