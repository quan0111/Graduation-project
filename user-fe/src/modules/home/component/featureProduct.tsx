import type { IProduct } from "@/modules/product/types";

import { ProductCard } from "@/modules/home/component/productCard";
import { SectionHeading } from "@/modules/home/component/sectionHeading";

interface FeaturedProductsProps {
  products: IProduct[];
  onProductClick?: (product: IProduct) => void;
}

export const FeaturedProducts = ({ products, onProductClick }: FeaturedProductsProps) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Nổi bật"
          title="Sản phẩm được quan tâm nhiều"
          description="Các lựa chọn đang được cộng đồng mua sắm theo dõi nhiều trong tuần này."
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={onProductClick} />
          ))}
        </div>
      </div>
    </section>
  );
};
