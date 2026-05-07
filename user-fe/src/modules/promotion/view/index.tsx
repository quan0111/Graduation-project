import { useMemo } from "react";

import { EmptyState } from "@/modules/order/components/emptyState";

import { CTASection } from "../components/CTA";
import { CategoryFilter } from "../components/categoryFilter";
import { PromotionGrid } from "../components/grid";
import { HeroBanner } from "../components/heroBanner";
import { ALL_PROMOTIONS, usePromotionCoupons, usePromotions } from "../hooks/usePromotion";

export default function PromotionPage() {
  const { data: promotions = [], isLoading, isError } = usePromotionCoupons();
  const categories = useMemo(
    () => [ALL_PROMOTIONS, ...Array.from(new Set(promotions.map((promotion) => promotion.category))).filter((item) => item !== ALL_PROMOTIONS)],
    [promotions],
  );
  const promo = usePromotions(promotions);

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Đang tải khuyến mãi...</div>;
  }

  if (isError) {
    return <div className="p-6 text-sm text-rose-500">Không thể tải khuyến mãi từ API.</div>;
  }

  return (
    <div className="p-6">
      <HeroBanner total={promotions.length} />

      <CategoryFilter
        value={promo.category}
        onChange={promo.setCategory}
        categories={categories}
      />

      {promo.filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <PromotionGrid
          list={promo.filtered}
          copied={promo.copied}
          onCopy={promo.copy}
        />
      )}

      <CTASection />
    </div>
  );
}
