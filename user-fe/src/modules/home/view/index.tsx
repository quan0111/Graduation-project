// pages/HomePage.tsx
import { HomeContainer } from "../containers/HomeContainer";

export default function HomePage() {
  return (
    <HomeContainer
      categories={categories}
      features={features}
      products={featuredProducts}
    />
  );
}