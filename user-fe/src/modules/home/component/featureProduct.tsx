// components/FeaturedProducts.tsx

import { ProductCard } from "./productCard";
import type { IProduct } from "@/modules/product/types";

interface FeaturedProductsProps {
  products: IProduct[];
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-2xl font-bold mb-6">
          Sản phẩm nổi bật
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

      </div>
    </section>
  );
};