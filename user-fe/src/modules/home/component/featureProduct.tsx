// components/FeaturedProducts.tsx
import { ProductCard } from "@/modules/products/components/ProductCard";

export const FeaturedProducts = ({ products }) => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-2xl font-bold mb-6">
          Sản phẩm nổi bật
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

      </div>
    </section>
  );
};