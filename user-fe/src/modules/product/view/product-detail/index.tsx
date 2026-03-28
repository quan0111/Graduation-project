// app/products/[id]/page.tsx

import { ProductGallery } from "@/components/product-detail/ProductGallery";
import { ProductInfo } from "@/components/product-detail/ProductInfo";
import { ProductPrice } from "@/components/product-detail/ProductPrice";
import { ProductVariants } from "@/components/product-detail/ProductVariants";
import { ProductAttributes } from "@/components/product-detail/ProductAttributes";
import { ProductTags } from "@/components/product-detail/ProductTags";
import { ProductActions } from "@/components/product-detail/ProductActions";

import { VendorInfo } from "@/components/product-detail/VendorInfo";
import { ShippingInfo } from "@/components/product-detail/ShippingInfo";

import { ProductDescription } from "@/components/product-detail/ProductDescription";
import { ProductReviews } from "@/components/product-detail/ProductReviews";
import { RelatedProducts } from "@/components/product-detail/RelatedProducts";

import { useProductDetail } from "@/hooks/useProductDetail";

export default function ProductDetailPage({ product }) {
  const {
    selectedVariant,
    setSelectedVariant,
    price,
    stock,
  } = useProductDetail(product);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">

      {/* 🔥 TOP SECTION */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT - IMAGE */}
        <ProductGallery
          images={product.Images?.map(i => i.url) || []}
          name={product.name}
        />

        {/* RIGHT */}
        <div className="lg:col-span-2">

          {/* TITLE + RATING */}
          <ProductInfo product={product} />

          {/* TAG */}
          <ProductTags tags={product.Tags} />

          {/* PRICE */}
          <ProductPrice price={price} />

          {/* VARIANT */}
          <ProductVariants
            variants={product.Variants}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
          />

          {/* SHIPPING */}
          <ShippingInfo />

          {/* ACTION */}
          <ProductActions stock={stock} />

          {/* VENDOR */}
          <VendorInfo product={product} />
        </div>
      </div>

      {/* 🔥 MID SECTION */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* ATTRIBUTES */}
        <div className="lg:col-span-2">
          <ProductAttributes attrs={product.Attributes} />
        </div>

        {/* EXTRA INFO (có thể thêm sau) */}
        <div></div>
      </div>

      {/* 🔥 DESCRIPTION */}
      <ProductDescription text={product.description} />

      {/* 🔥 REVIEWS */}
      <ProductReviews reviews={product.Review} />

      {/* 🔥 RELATED */}
      <RelatedProducts />

    </div>
  );
}