import type { ReactNode } from "react";

import type { ICategory } from "@/modules/category/types";
import { CategoryGrid } from "@/modules/home/component/categoryGrid";
import { FeatureSection } from "@/modules/home/component/featureSection";
import { FeaturedProducts } from "@/modules/home/component/featureProduct";
import { HeroSection } from "@/modules/home/component/heroSection";
import { MarketingBannerStrip } from "@/modules/home/component/marketingBannerStrip";
import { Newsletter } from "@/modules/home/component/newsLetter";
import type { MarketingBanner } from "@/modules/marketing/api/marketing";
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
  heroBanner?: MarketingBanner | null;
  marketingBanners?: MarketingBanner[];
  isRecommendationLoading?: boolean;
  onProductClick?: (product: IProduct, source: "featured" | "recommended") => void;
  onBannerClick?: (banner: MarketingBanner) => void;
}

export const HomeContainer = ({
  categories,
  features,
  products,
  recommendedProducts,
  heroBanner = null,
  marketingBanners = [],
  isRecommendationLoading = false,
  onProductClick,
  onBannerClick,
}: HomeContainerProps) => {
  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <HeroSection banner={heroBanner} onBannerClick={onBannerClick} />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <MarketingBannerStrip banners={marketingBanners} onBannerClick={onBannerClick} />

        <div className="py-8 md:py-12">
          <CategoryGrid categories={categories} />
        </div>
        <FeatureSection features={features} />
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-6">
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
