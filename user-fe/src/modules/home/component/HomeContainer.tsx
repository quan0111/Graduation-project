import type { ReactNode } from "react";

import type { ICategory } from "@/modules/category/types";
import { CategoryGrid } from "@/modules/home/component/categoryGrid";
import { FeatureSection } from "@/modules/home/component/featureSection";
import { FeaturedProducts } from "@/modules/home/component/featureProduct";
import { HeroSection } from "@/modules/home/component/heroSection";
import { Newsletter } from "@/modules/home/component/newsLetter";
import type { IProduct } from "@/modules/product/types";
import { RecommendationSection } from "@/modules/recommendation/components/recommendation-section";

interface Feature {
  id: string | number;
  icon: ReactNode;
  title: string;
  description: string;
}

interface HomeContainerProps {
  categories: ICategory[];
  features: Feature[];
  products: IProduct[];
  recommendedProducts: IProduct[];
  isRecommendationLoading?: boolean;
  onProductClick?: (product: IProduct, source: "featured" | "recommended") => void;
}

export const HomeContainer = ({
  categories,
  features,
  products,
  recommendedProducts,
  isRecommendationLoading = false,
  onProductClick,
}: HomeContainerProps) => {
  return (
    <div className="bg-[#fffaf6]">
      <HeroSection />
      <CategoryGrid categories={categories} />
      <FeatureSection features={features} />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12">
        <RecommendationSection
          title="Dành riêng cho bạn"
          subtitle="Sản phẩm được chọn dựa trên hành vi xem và mua gần đây của bạn."
          products={recommendedProducts}
          isLoading={isRecommendationLoading}
          onProductClick={(product) => onProductClick?.(product, "recommended")}
        />

        <FeaturedProducts products={products} onProductClick={(product) => onProductClick?.(product, "featured")} />
      </div>

      <Newsletter />
    </div>
  );
};
