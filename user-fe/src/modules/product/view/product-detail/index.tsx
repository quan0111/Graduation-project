import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import type { MarketingBanner } from "@/modules/marketing/api/marketing";
import { useActiveBanners, useTrackBannerAction } from "@/modules/marketing/api/marketing";
import { MarketingBannerStrip } from "@/modules/marketing/components/marketing-banner-strip";
import { ProductActions } from "@/modules/product/components/Action";
import { ProductAttributes } from "@/modules/product/components/specification";
import { ProductDescription } from "@/modules/product/components/description";
import { ProductGallery } from "@/modules/product/components/gallery";
import { ProductInfo } from "@/modules/product/components/productInfo";
import { ProductPrice } from "@/modules/product/components/price";
import { ProductReviews } from "@/modules/product/components/review";
import { ProductVariants } from "@/modules/product/components/variantSelector";
import { RecentlyViewed } from "@/modules/product/components/RecentlyViewed";
import { ShippingInfo } from "@/modules/product/components/shippingInfo";
import { VendorInfo } from "@/modules/product/components/vendorInfo";
import { useGetProductByID } from "@/modules/product/api/get-product-id";
import { useProductDetail } from "@/modules/product/hooks/useProductDetail";
import { useRecentlyViewed } from "@/modules/product/hooks/useRecentlyViewed";
import type { IProduct } from "@/modules/product/types";
import { normalizeProduct } from "@/modules/product/utils/normalize-product";
import { useRecommendations } from "@/modules/recommendation/api/get-recommendations";
import { RecommendationSection } from "@/modules/recommendation/components/recommendation-section";
import { useTrackProductBehavior } from "@/modules/recommendation/hooks/useTrackProductBehavior";
import { useAuthStore } from "@/stores/auth.store";

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = Number(id);
  const user = useAuthStore((state) => state.user);
  const viewedBannerIdsRef = useRef<Set<number>>(new Set());

  const { data: rawProduct, isLoading, error } = useGetProductByID(productId, {
    enabled: Number.isFinite(productId) && productId > 0,
  });
  const { data: recommendedProducts = [], isLoading: recommendationLoading } = useRecommendations({
    topK: 8,
    productId: Number.isFinite(productId) && productId > 0 ? productId : undefined,
  });
  const { trackAddToCart, trackClick, trackView } = useTrackProductBehavior();
  const { data: productDetailBanners = [] } = useActiveBanners("PRODUCT_DETAIL");
  const trackBannerAction = useTrackBannerAction();
  const { addRecentlyViewed } = useRecentlyViewed();
  const trackedViewByProductIdRef = useRef<Set<number>>(new Set());

  const product: IProduct | undefined = useMemo(() => {
    if (!rawProduct) {
      return undefined;
    }
    return normalizeProduct(rawProduct as unknown as Record<string, unknown>);
  }, [rawProduct]);

  const { selectedVariant, setSelectedVariant, price, originalPrice, stock } = useProductDetail(product as IProduct);
  const galleryImages = useMemo(() => {
    const productImages = product?.images?.map((image) => image.url).filter(Boolean) ?? [];
    const variantImages = (selectedVariant?.variantImages ?? selectedVariant?.images ?? [])
      .map((image) => image.url)
      .filter(Boolean);

    return Array.from(new Set([...variantImages, ...productImages]));
  }, [product?.images, selectedVariant]);

  useEffect(() => {
    if (!product) {
      return;
    }
    if (trackedViewByProductIdRef.current.has(product.id)) {
      return;
    }
    trackedViewByProductIdRef.current.add(product.id);
    trackView(product.id, { page: "product_detail" });
    addRecentlyViewed(product);
  }, [product, trackView, addRecentlyViewed]);

  useEffect(() => {
    productDetailBanners.forEach((banner) => {
      if (viewedBannerIdsRef.current.has(banner.id)) {
        return;
      }
      viewedBannerIdsRef.current.add(banner.id);
      trackBannerAction.mutate({ bannerId: banner.id, action: "VIEW" });
    });
  }, [productDetailBanners, trackBannerAction]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-slate-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-red-500">
        Không thể tải chi tiết sản phẩm.
      </div>
    );
  }

  const recommendationCandidates = recommendedProducts.filter((item) => item.id !== product.id).slice(0, 5);
  const handleBannerClick = (banner: MarketingBanner) => {
    trackBannerAction.mutate({ bannerId: banner.id, action: "CLICK" });
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] pb-12 pt-6">
      <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
        <MarketingBannerStrip banners={productDetailBanners.slice(0, 6)} onBannerClick={handleBannerClick} />

        <div className="grid gap-6 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ProductGallery images={galleryImages} name={product.name} />
          </div>

          <div className="space-y-4 lg:col-span-7">
            <ProductInfo product={product} />
            <ProductPrice price={price} originalPrice={originalPrice > price ? originalPrice : undefined} />
            <ShippingInfo />

            <ProductVariants variants={product.variants ?? []} selected={selectedVariant} onSelect={setSelectedVariant} />

            <ProductActions
              stock={stock}
              productId={product.id}
              variantId={selectedVariant?.id ?? null}
              shopId={product.shop?.id ?? null}
              onAddedToCart={(quantity) => trackAddToCart(product.id, { page: "product_detail", quantity })}
            />
          </div>
        </div>

        <VendorInfo product={product} />

        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="rounded-xl bg-orange-50 p-4 text-lg font-semibold uppercase text-slate-900">Chi tiết sản phẩm</h2>
          <div className="mt-6">
            <ProductAttributes attrs={product.attributes ?? []} />
          </div>
        </section>

        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="rounded-xl bg-orange-50 p-4 text-lg font-semibold uppercase text-slate-900">Mô tả sản phẩm</h2>
          <div className="mt-6">
            <ProductDescription text={product.description ?? ""} />
          </div>
        </section>

        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Đánh giá sản phẩm</h2>
          <ProductReviews productId={productId} userId={user?.id} />
        </section>

        <RecommendationSection
          title="Bạn cũng có thể quan tâm"
          subtitle="Những sản phẩm liên quan theo hành vi mua sắm của bạn."
          products={recommendationCandidates}
          isLoading={recommendationLoading}
          onProductClick={(recommendedProduct) =>
            trackClick(recommendedProduct.id, { page: "product_detail", source: "recommendation" })
          }
        />

        <RecentlyViewed />
      </div>
    </div>
  );
}
