import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

import { ProductActions } from "@/modules/product/components/Action";
import { ProductAttributes } from "@/modules/product/components/specification";
import { ProductDescription } from "@/modules/product/components/description";
import { ProductGallery } from "@/modules/product/components/gallery";
import { ProductInfo } from "@/modules/product/components/productInfo";
import { ProductPrice } from "@/modules/product/components/price";
import { ProductReviews } from "@/modules/product/components/review";
import { ProductVariants } from "@/modules/product/components/variantSelector";
import { ShippingInfo } from "@/modules/product/components/shippingInfo";
import { VendorInfo } from "@/modules/product/components/vendorInfo";
import { useGetProductByID } from "@/modules/product/api/get-product-id";
import { useProductDetail } from "@/modules/product/hooks/useProductDetail";
import type { IProduct } from "@/modules/product/types";
import { normalizeProduct } from "@/modules/product/utils/normalize-product";
import { useRecommendations } from "@/modules/recommendation/api/get-recommendations";
import { RecommendationSection } from "@/modules/recommendation/components/recommendation-section";
import { useTrackProductBehavior } from "@/modules/recommendation/hooks/useTrackProductBehavior";

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = Number(id);

  const { data: rawProduct, isLoading, error } = useGetProductByID(productId, {
    enabled: Number.isFinite(productId) && productId > 0,
  });
  const { data: recommendedProducts = [], isLoading: recommendationLoading } = useRecommendations({
    topK: 8,
    productId: Number.isFinite(productId) && productId > 0 ? productId : undefined,
  });
  const { trackAddToCart, trackClick, trackView } = useTrackProductBehavior();
  const trackedViewByProductIdRef = useRef<Set<number>>(new Set());

  const product: IProduct | undefined = useMemo(() => {
    if (!rawProduct) {
      return undefined;
    }
    return normalizeProduct(rawProduct as unknown as Record<string, unknown>);
  }, [rawProduct]);

  const { selectedVariant, setSelectedVariant, price, stock } = useProductDetail(product as IProduct);

  useEffect(() => {
    if (!product) {
      return;
    }
    if (trackedViewByProductIdRef.current.has(product.id)) {
      return;
    }
    trackedViewByProductIdRef.current.add(product.id);
    trackView(product.id, { page: "product_detail" });
  }, [product, trackView]);

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

  return (
    <div className="min-h-screen bg-[#fffaf6] pb-12 pt-6">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <div className="grid gap-6 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ProductGallery images={product.images?.map((image) => image.url) ?? []} name={product.name} />
          </div>

          <div className="space-y-4 lg:col-span-7">
            <ProductInfo product={product} />
            <ProductPrice price={price} originalPrice={product.price} />
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
          <ProductReviews productId={productId} />
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
      </div>
    </div>
  );
}
