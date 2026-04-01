// blocks/ProductCardCompare.tsx
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string | number;
  name: string;
  image?: string;
  price: number;
  rating?: number;
}

interface ProductCardCompareProps {
  product: Product;
  onRemove: (id: string | number) => void;
}

export const ProductCardCompare: React.FC<ProductCardCompareProps> = ({
  product,
  onRemove,
}) => {
  return (
    <div className="relative p-4 border rounded-xl hover:shadow transition bg-white">

      {/* Remove button */}
      <button
        onClick={() => onRemove(product.id)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
        aria-label="Xóa sản phẩm"
      >
        <X size={16} />
      </button>

      {/* Image */}
      <img
        src={product.image || "/placeholder.png"}
        alt={product.name}
        className="h-40 mx-auto object-contain"
      />

      {/* Name */}
      <p className="text-sm font-medium line-clamp-2 mt-2">
        {product.name}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-1 mt-1">
        <Star size={12} className="text-yellow-400 fill-yellow-400" />
        <span>{product.rating ?? 0}</span>
      </div>

      {/* Price */}
      <p className="text-red-500 font-bold">
        {(product.price ?? 0).toLocaleString()}đ
      </p>

      {/* Action */}
      <Button className="w-full mt-2 bg-red-500 hover:bg-red-600 transition">
        Mua
      </Button>
    </div>
  );
};