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

/* ---------- TOGGLE ---------- */
const USE_MOCK = true;

/* ---------- MOCK ---------- */

const now = new Date().toISOString();

const mockProduct: IProduct = {
  id: "1",
  name: "Giày sneaker premium",
  slug: "giay-sneaker-premium",
  description:
    "Giày sneaker chất lượng cao, thiết kế hiện đại, phù hợp mọi phong cách.",

  price: 990000,
  shop_id: 1,
  category_id: 1,

  status: "ACTIVE",

  created_at: now,
  updated_at: now,

  Images: [
    {
      id: 1,
      url: "https://picsum.photos/500?1",
      position: 1,
      is_primary: true,
      product_id: 1,
      created_at: now,
    },
    {
      id: 2,
      url: "https://picsum.photos/500?2",
      position: 2,
      is_primary: false,
      product_id: 1,
      created_at: now,
    },
    {
      id: 3,
      url: "https://picsum.photos/500?3",
      position: 3,
      is_primary: false,
      product_id: 1,
      created_at: now,
    },
  ],

  Variants: [
    {
      id: 1,
      name: "Size 39",
      stock: 12,
      price: 990000,
      product_id: 1,
      created_at: now,
      updated_at: now,
      VariantImage: [],
    },
    {
      id: 2,
      name: "Size 40",
      stock: 8,
      price: 990000,
      product_id: 1,
      created_at: now,
      updated_at: now,
      VariantImage: [],
    },
    {
      id: 3,
      name: "Size 41",
      stock: 5,
      price: 990000,
      product_id: 1,
      created_at: now,
      updated_at: now,
      VariantImage: [],
    },
  ],

  Attributes: [
    { id: 1, product_id: 1, key: "Chất liệu", value: "Da cao cấp" },
    { id: 2, product_id: 1, key: "Đế", value: "Cao su chống trượt" },
    { id: 3, product_id: 1, key: "Xuất xứ", value: "Việt Nam" },
  ],

  Tags: [
    { id: 1, name: "Hot" },
    { id: 2, name: "Best Seller" },
  ],

  Review: [
    {
      id: 1,
      rating: 5,
      comment: "Giày đẹp, mang rất êm!",
      created_at: now,
    } as any,
    {
      id: 2,
      rating: 4,
      comment: "Ổn trong tầm giá",
      created_at: now,
    } as any,
  ],

  Shop: {
    id: 1,
    name: "Sneaker Store",
  } as any,

  Category: {
    id: 1,
    name: "Giày",
    created_at: now,
    updated_at: now,
  },
};

/* ---------- PAGE ---------- */

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = Number(id);

  const { data, isLoading, error } = useGetProductByID(productId);

  const product: IProduct | undefined = USE_MOCK
    ? mockProduct
    : data?.data?.data?.[0];

  if (!USE_MOCK && isLoading) return <div>Loading...</div>;
  if (!USE_MOCK && (error || !product)) {
    return <div>Lỗi load sản phẩm</div>;
  }

  const {
    selectedVariant,
    setSelectedVariant,
    price,
    stock,
  } = useProductDetail(product!);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* TOP */}
      <div className="grid lg:grid-cols-3 gap-8">
        <ProductGallery
          images={product!.Images?.map((i) => i.url) ?? []}
          name={product!.name}
        />

        <div className="lg:col-span-2 space-y-4">
          <ProductInfo product={product!} />

          <ProductTags tags={product!.Tags ?? []} />

          <ProductPrice price={price} />

          <ProductVariants
            variants={product!.Variants ?? []}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
          />

          <ShippingInfo />

          <ProductActions stock={stock} />

          <VendorInfo product={product!} />
        </div>
      </div>

      {/* MID */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductAttributes attrs={product!.Attributes ?? []} />
        </div>
      </div>

      {/* DESCRIPTION */}
      <ProductDescription text={product!.description ?? ""} />

      {/* REVIEWS */}
      <ProductReviews reviews={product!.Review ?? []} />

      {/* RELATED */}
      <RelatedProducts />
    </div>
  );
}