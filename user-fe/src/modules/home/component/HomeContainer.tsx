// containers/HomeContainer.tsx

import { HeroSection } from "./heroSection";
import { CategoryGrid } from "./categoryGrid";
import { FeatureSection } from "./featureSection";
import { FeaturedProducts } from "./featureProduct";
import { Newsletter } from "./newsLetter";

import type { ICategory } from "@/modules/category/types";
import type { IProduct } from "@/modules/product/types";
import type { ReactNode } from "react";

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
}

export const HomeContainer: React.FC<HomeContainerProps> = ({
  categories,
  features,
  products,
}) => {
  return (
    <>
      <HeroSection />

      {categories?.length > 0 && (
        <CategoryGrid categories={categories} />
      )}

      {features?.length > 0 && (
        <FeatureSection features={features} />
      )}

      {products?.length > 0 && (
        <FeaturedProducts products={products} />
      )}

      <Newsletter />
    </>
  );
};