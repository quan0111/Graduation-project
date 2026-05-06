// src/modules/product/view/detail/index.tsx

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Lỗi load sản phẩm
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-10">

      <div className="max-w-7xl mx-auto pt-5 space-y-5">

        {/* PRODUCT */}
        <div className="bg-white p-5 grid grid-cols-12 gap-10">

          {/* LEFT */}
          <div className="col-span-5">
            <ProductGallery
              images={product.images?.map((i) => i.url) ?? []}
              name={product.name}
            />
          </div>

          {/* RIGHT */}
          <div className="col-span-7">

            <ProductInfo product={product} />

            <ProductPrice
              price={price}
              originalPrice={product.price}
            />

            <ShippingInfo />

            <div className="mt-6">
              <ProductVariants
                variants={product.variants ?? []}
                selected={selectedVariant}
                onSelect={setSelectedVariant}
              />
            </div>

            <div className="mt-8">
              <ProductActions
                stock={stock}
                productId={product.id}
                variantId={selectedVariant?.id ?? null}
                shopId={product.shop?.id ?? null}
              />
            </div>

          </div>

        </div>

        {/* SHOP */}
        <VendorInfo product={product} />

        {/* DETAIL */}
        <div className="bg-white p-6">

          <h2 className="bg-[#f5f5f5] p-4 text-[20px] font-medium uppercase">
            Chi tiết sản phẩm
          </h2>

          <div className="mt-8">
            <ProductAttributes attrs={product.attributes ?? []} />
          </div>

        </div>

        {/* DESCRIPTION */}
        <div className="bg-white p-6">

          <h2 className="bg-[#f5f5f5] p-4 text-[20px] font-medium uppercase">
            Mô tả sản phẩm
          </h2>

          <div className="mt-8">
            <ProductDescription text={product.description ?? ""} />
          </div>

        </div>

        {/* REVIEW */}
        <div className="bg-white p-6">

          <h2 className="text-[24px] mb-6 uppercase">
            Đánh giá sản phẩm
          </h2>

          <ProductReviews reviews={product.reviews ?? []} />

        </div>

        {/* RELATED */}
        <div className="bg-white p-6">

          <h2 className="text-[22px] uppercase mb-5">
            Các sản phẩm khác của shop
          </h2>

          <RelatedProducts />

        </div>

      </div>
    </div>
  );
}