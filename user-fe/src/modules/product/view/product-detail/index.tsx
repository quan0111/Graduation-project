'use client';

import { useParams } from "react-router-dom";
import { useGetProductByID } from "../../api/get-product-id";

import { ProductGallery } from "../../components/gallery";
import { ProductInfo } from "../../components/productInfo";
import { ProductPrice } from "../../components/price";
import { ProductVariants } from "../../components/variantSelector";
import { ProductAttributes } from "../../components/specification";
import { ProductTags } from "../../components/tag";
import { ProductActions } from "../../components/Action";
import { VendorInfo } from "../../components/vendorInfo";
import { ShippingInfo } from "../../components/shippingInfo";
import { ProductDescription } from "../../components/description";
import { ProductReviews } from "../../components/review";
import { RelatedProducts } from "../../components/relatedProduct";

import { useProductDetail } from "../../hooks/useProductDetail";
import type { IProduct } from "../../types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = Number(id);

  const { data, isLoading, error } = useGetProductByID(productId);

  const product: IProduct | undefined = data;

  const {
    selectedVariant,
    setSelectedVariant,
    price,
    stock,
  } = useProductDetail(product as IProduct);

  // 👉 xử lý UI sau
  if (isLoading) return <div>Loading...</div>;

  if (error || !product) {
    return <div>Lỗi load sản phẩm</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">

      <div className="grid lg:grid-cols-3 gap-8">
        <ProductGallery
          images={product.images?.map((i) => i.url) ?? []}
          name={product.name}
        />

        <div className="lg:col-span-2 space-y-4">
          <ProductInfo product={product} />

          <ProductTags tags={product.tags ?? []} />

          <ProductPrice price={price} />

          <ProductVariants
            variants={product.variants ?? []}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
          />

          <ShippingInfo />

          <ProductActions stock={stock} productId={product.id} variantId={selectedVariant?.id ?? null} />

          <VendorInfo product={product} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductAttributes attrs={product.attributes ?? []} />
        </div>
      </div>

      <ProductDescription text={product.description ?? ""} />

      <ProductReviews reviews={product.reviews ?? []} />

      <RelatedProducts />
    </div>
  );
}