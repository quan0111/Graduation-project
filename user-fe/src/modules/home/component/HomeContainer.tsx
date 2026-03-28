// containers/HomeContainer.tsx
import { HeroSection } from "../components/HeroSection";
import { CategoryGrid } from "../components/CategoryGrid";
import { FeatureSection } from "../components/FeatureSection";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { Newsletter } from "../components/Newsletter";

export const HomeContainer = ({
  categories,
  features,
  products,
}) => {
  return (
    <>
      <HeroSection />
      <CategoryGrid categories={categories} />
      <FeatureSection features={features} />
      <FeaturedProducts products={products} />
      <Newsletter />
    </>
  );
};