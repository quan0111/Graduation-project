// components/products/ProductGrid.tsx
import { ProductCard } from "./productCard";
import type { IProduct } from "../types";

export const ProductGrid = ({ products }: { products: IProduct[] }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};