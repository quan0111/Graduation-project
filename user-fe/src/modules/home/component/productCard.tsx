import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { IProduct } from "@/modules/product/types";

interface ProductCardProps {
  product: IProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  // ================= IMAGE =================
  const image =
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png";

  // ================= RATING =================
  const reviews = product.reviews || [];

  const rating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
        reviews.length
      : 0;

  const reviewsCount = reviews.length;

  const discount = 0;

  return (
    <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-border h-full flex flex-col">

        {/* IMAGE */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden group">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />

          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-3 flex-1 flex flex-col justify-between">

          {/* NAME */}
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {product.category?.name || "Chưa phân loại"}
            </p>

            <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2">
              {product.name}
            </h3>
          </div>

          {/* RATING */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <span className="text-xs text-gray-500">
              ({reviewsCount})
            </span>
          </div>

          {/* PRICE */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {(product.price || 0).toLocaleString("vi-VN")}đ
            </span>
          </div>

        </div>
      </div>
    </Link>
  );
}