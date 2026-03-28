// blocks/ProductCardCompare.tsx
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProductCardCompare = ({ product, onRemove }) => {
  return (
    <div className="relative p-4 border rounded-xl hover:shadow transition">

      <button
        onClick={() => onRemove(product.id)}
        className="absolute top-2 right-2"
      >
        <X size={16}/>
      </button>

      <img src={product.image} className="h-40 mx-auto object-contain"/>

      <p className="text-sm font-medium line-clamp-2 mt-2">
        {product.name}
      </p>

      <div className="flex items-center gap-1 mt-1">
        <Star size={12} className="text-yellow-400 fill-yellow-400"/>
        <span>{product.rating}</span>
      </div>

      <p className="text-red-500 font-bold">
        {product.price.toLocaleString()}đ
      </p>

      <Button className="w-full mt-2 bg-red-500">
        Mua
      </Button>
    </div>
  );
};