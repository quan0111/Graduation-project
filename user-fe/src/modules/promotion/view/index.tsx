import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { EmptyState } from "@/modules/order/components/emptyState";
import { useActiveBanners, useTrackBannerClick } from "@/modules/marketing/api/marketing";
import { ProductCard } from "@/modules/product/components/productcard";
import { useActiveFlashSales } from "@/modules/promotion/api/flash-sale";
import { getFlashSaleProducts } from "@/modules/promotion/utils/flash-sale";
import { useWishlistActions } from "@/modules/wishlist/hooks/useWishlistActions";

import { CTASection } from "../components/CTA";
import { CategoryFilter } from "../components/categoryFilter";
import { PromotionGrid } from "../components/grid";
import { ALL_PROMOTIONS, usePromotionCoupons, usePromotions } from "../hooks/usePromotion";

const BANNER_LAYOUT_CLASS: Record<string, string> = {
  FULL: "md:col-span-12",
  HALF: "md:col-span-6",
  ONE_THIRD: "md:col-span-4",
  TWO_THIRDS: "md:col-span-8",
  ONE_QUARTER: "md:col-span-3",
  THREE_QUARTERS: "md:col-span-9",
};

const getBannerLayoutClass = (layout?: string | null) => {
  const normalizedLayout = String(layout || "ONE_THIRD").toUpperCase();
  return BANNER_LAYOUT_CLASS[normalizedLayout] ?? BANNER_LAYOUT_CLASS.ONE_THIRD;
};

export default function PromotionPage() {
  const [searchParams] = useSearchParams();
  const campaignId = Number(searchParams.get("campaign") || 0);
  const { data: banners = [] } = useActiveBanners();
  const { wishlistIds, pendingProductId, toggleWishlist } = useWishlistActions();
  const trackBannerClick = useTrackBannerClick();
  const { data: activeFlashSales = [], isLoading: flashSalesLoading, isError: flashSalesError } = useActiveFlashSales();
  const { data: promotions = [], isLoading, isError } = usePromotionCoupons();
  const categories = useMemo(
    () => [ALL_PROMOTIONS, ...Array.from(new Set(promotions.map((promotion) => promotion.category))).filter((item) => item !== ALL_PROMOTIONS)],
    [promotions],
  );
  const promo = usePromotions(promotions);

  const visibleFlashSales = useMemo(
    () => (campaignId ? activeFlashSales.filter((sale) => sale.id === campaignId) : activeFlashSales),
    [activeFlashSales, campaignId],
  );
  const selectedFlashSale = campaignId ? activeFlashSales.find((sale) => sale.id === campaignId) : null;
  const flashSaleProducts = useMemo(() => getFlashSaleProducts(visibleFlashSales, 12), [visibleFlashSales]);
  const flashSaleTitle = selectedFlashSale?.name || "Sản phẩm đang giảm giá";

  return (
    <main className="min-h-screen bg-[#fff7ed] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-4xl bg-slate-950 text-white shadow-sm">
          {banners.length > 0 ? (
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 md:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">Ưu đãi hôm nay</p>
                <h1 className="mt-4 text-3xl font-bold md:text-5xl">{banners[0].title}</h1>
                {banners[0].subtitle ? (
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 md:text-base">{banners[0].subtitle}</p>
                ) : null}
                {banners[0].linkUrl ? (
                  <Link
                    to={banners[0].linkUrl}
                    onClick={() => trackBannerClick.mutate(banners[0].id)}
                    className="mt-6 inline-flex rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
                  >
                    Xem ngay
                  </Link>
                ) : null}
              </div>
              <picture className="min-h-64">
                {banners[0].mobileImageUrl ? <source media="(max-width: 768px)" srcSet={banners[0].mobileImageUrl} /> : null}
                <img src={banners[0].imageUrl} alt={banners[0].title} className="h-full min-h-64 w-full object-cover" />
              </picture>
            </div>
          ) : (
            <div className="p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">Khuyến mãi</p>
              <h1 className="mt-4 text-3xl font-bold md:text-5xl">Ưu đãi và flash sale</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 md:text-base">
                Tổng hợp voucher, sản phẩm đang giảm giá và các chiến dịch marketing đang chạy.
              </p>
            </div>
          )}
        </section>

        {banners.length > 1 ? (
          <section className="grid gap-4 md:grid-cols-12">
            {banners.slice(1, 7).map((banner) => (
              <Link
                key={banner.id}
                to={banner.linkUrl || "/promotions"}
                onClick={() => trackBannerClick.mutate(banner.id)}
                className={`group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100 ${getBannerLayoutClass(banner.layout)}`}
              >
                <img src={banner.imageUrl} alt={banner.title} className="h-36 w-full object-cover transition group-hover:scale-105" />
                <div className="p-4">
                  <p className="font-semibold text-slate-950">{banner.title}</p>
                  {banner.subtitle ? <p className="mt-1 line-clamp-2 text-sm text-slate-500">{banner.subtitle}</p> : null}
                </div>
              </Link>
            ))}
          </section>
        ) : null}

        <section className="space-y-4" id="flash-sale">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Flash sale</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{flashSaleTitle}</h2>
            </div>
            <Link to="/flash-sale" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              {campaignId ? "Xem mọi flash sale" : "Xem tất cả"}
            </Link>
          </div>

          {flashSalesLoading ? (
            <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-orange-100">
              Đang tải flash sale...
            </div>
          ) : null}

          {flashSalesError ? (
            <div className="rounded-2xl bg-white p-6 text-sm text-rose-500 shadow-sm ring-1 ring-orange-100">
              Không thể tải flash sale từ API.
            </div>
          ) : null}

          {!flashSalesLoading && !flashSalesError && flashSaleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {flashSaleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.has(product.id)}
                  wishlistPending={pendingProductId === product.id}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          ) : null}

          {!flashSalesLoading && !flashSalesError && flashSaleProducts.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-orange-100">
              {campaignId
                ? "Chiến dịch flash sale này chưa có sản phẩm đang hoạt động hoặc đã hết thời gian chạy."
                : "Chưa có sản phẩm flash sale đang hoạt động."}
            </div>
          ) : null}
        </section>

        <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-orange-100 md:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Voucher</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Mã giảm giá khả dụng</h2>
          </div>

          {isLoading ? <div className="p-6 text-sm text-slate-500">Đang tải khuyến mãi...</div> : null}

          {isError ? <div className="p-6 text-sm text-rose-500">Không thể tải khuyến mãi từ API.</div> : null}

          {!isLoading && !isError ? (
            <>
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
            </>
          ) : null}
        </section>

        <CTASection />
      </div>
    </main>
  );
}
