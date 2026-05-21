import type { IProduct } from "@/modules/product/types";
import { RecommendationCard } from "@/modules/recommendation/components/recommendation-card";

interface RecommendationSectionProps {
  title: string;
  subtitle: string;
  products: IProduct[];
  isLoading?: boolean;
  onProductClick?: (product: IProduct) => void;
}

const RecommendationSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="h-64 animate-pulse rounded-2xl border border-orange-100 bg-orange-50/70" />
    ))}
  </div>
);

export const RecommendationSection = ({
  title,
  subtitle,
  products,
  isLoading = false,
  onProductClick,
}: RecommendationSectionProps) => {
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white/90 p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Gợi ý</p>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      {isLoading ? (
        <RecommendationSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <RecommendationCard key={product.id} product={product} onClick={onProductClick} />
          ))}
        </div>
      )}
    </section>
  );
};
