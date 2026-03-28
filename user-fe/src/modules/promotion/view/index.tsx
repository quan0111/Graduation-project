import { useState } from "react";
import { usePromotions } from "../hooks/usePromotion";
import { HeroBanner } from "../components/heroBanner";
import { CategoryFilter } from "../components/categoryFilter";
import { EmptyState } from "@/modules/order/components/emptyState";
import { PromotionGrid } from "../components/grid";
import { CTASection } from "../components/CTA";

// mock data (hoặc API)

export default function Page() {
  const [categories] = useState<string[]>([
    "Tất cả",
    "Shopee",
    "Tiki",
    "Lazada",
  ]);
   const promotions = [
  {
    id: "1",
    title: "Giảm 50K cho đơn từ 300K",
    description: "Áp dụng cho tất cả sản phẩm",
    image: "https://via.placeholder.com/400x200",
    discount: "-50K",
    code: "SALE50",
    used: 80,
    total: 100,
    validUntil: "2026-12-31",
    category: "Shopee",
  },
  {
    id: "2",
    title: "Giảm 20%",
    description: "Áp dụng cho ngành hàng điện tử",
    image: "https://via.placeholder.com/400x200",
    discount: "-20%",
    code: "ELEC20",
    used: 30,
    total: 100,
    validUntil: "2026-10-10",
    category: "Tiki",
  },
  {
    id: "3",
    title: "Freeship toàn quốc",
    description: "Không giới hạn giá trị đơn hàng",
    image: "https://via.placeholder.com/400x200",
    discount: "FREESHIP",
    code: "SHIP0",
    used: 90,
    total: 100,
    validUntil: "2026-09-01",
    category: "Lazada",
  },
  {
    id: "4",
    title: "Giảm 100K",
    description: "Đơn từ 1 triệu",
    image: "https://via.placeholder.com/400x200",
    discount: "-100K",
    code: "BIGSALE",
    used: 10,
    total: 50,
    validUntil: "2026-08-20",
    category: "Shopee",
  },
];

  const promo = usePromotions(promotions);

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