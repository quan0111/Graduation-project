import type { IActiveFlashSale, IProduct, IProductImage, IProductVariant, IVariantImage } from "@/modules/product/types";

type UnknownRecord = Record<string, any>;

const nowIso = new Date().toISOString();

const normalizeActiveFlashSale = (sale?: UnknownRecord | null): IActiveFlashSale | null =>
  sale
    ? {
        id: Number(sale.id ?? 0),
        flashSaleId: Number(sale.flashSaleId ?? sale.flash_sale_id ?? 0),
        variantId: sale.variantId ?? sale.variant_id ?? null,
        salePrice: Number(sale.salePrice ?? sale.sale_price ?? 0),
        stockLimit: sale.stockLimit ?? sale.stock_limit ?? null,
        soldCount: Number(sale.soldCount ?? sale.sold_count ?? 0),
        purchaseLimit: sale.purchaseLimit ?? sale.purchase_limit ?? null,
        startsAt: sale.startsAt ?? sale.starts_at ?? nowIso,
        endsAt: sale.endsAt ?? sale.ends_at ?? nowIso,
      }
    : null;

const normalizeImage = (image: UnknownRecord): IProductImage => ({
  id: Number(image.id ?? 0),
  url: image.url ?? "",
  position: Number(image.position ?? 0),
  is_primary: Boolean(image.is_primary ?? image.isPrimary ?? false),
  product_id: Number(image.product_id ?? image.productId ?? 0),
  created_at: image.created_at ?? image.createdAt ?? nowIso,
  deleted_at: image.deleted_at ?? image.deletedAt ?? null,
});

const normalizeVariantImage = (image: UnknownRecord): IVariantImage => ({
  id: Number(image.id ?? 0),
  url: image.url ?? "",
  position: Number(image.position ?? 0),
  variant_id: Number(image.variant_id ?? image.variantId ?? 0),
  created_at: image.created_at ?? image.createdAt ?? nowIso,
  deleted_at: image.deleted_at ?? image.deletedAt ?? null,
});

const normalizeVariant = (variant: UnknownRecord): IProductVariant => {
  const variantImages = (variant.images ?? variant.variantImages ?? []).map(normalizeVariantImage);

  return {
    id: Number(variant.id ?? 0),
    sku: variant.sku ?? null,
    name: variant.name ?? "",
    stock: Number(variant.stock ?? 0),
    weight: variant.weight ?? null,
    product_id: Number(variant.product_id ?? variant.productId ?? 0),
    price: Number(variant.price ?? 0),
    created_at: variant.created_at ?? variant.createdAt ?? nowIso,
    updated_at: variant.updated_at ?? variant.updatedAt ?? nowIso,
    deleted_at: variant.deleted_at ?? variant.deletedAt ?? null,
    variantImages,
    images: variantImages,
    activeFlashSale: normalizeActiveFlashSale(variant.activeFlashSale),
  };
};

const normalizeReview = (review: UnknownRecord) => ({
  id: Number(review.id ?? 0),
  rating: Number(review.rating ?? 0),
  comment: review.comment ?? null,
  is_verified_purchase: Boolean(review.is_verified_purchase ?? review.isVerifiedPurchase ?? false),
  user_id: Number(review.user_id ?? review.userId ?? review.user?.id ?? 0),
  product_id: Number(review.product_id ?? review.productId ?? 0),
  created_at: review.created_at ?? review.createdAt ?? nowIso,
  deleted_at: review.deleted_at ?? review.deletedAt ?? null,
  User: review.User ?? review.user,
  Product: review.Product ?? review.product,
});

export const normalizeProduct = (product: UnknownRecord): IProduct => {
  const images = (product.images ?? []).map(normalizeImage);
  const variants = (product.variants ?? []).map(normalizeVariant);

  return {
    id: Number(product.id ?? 0),
    name: product.name ?? "",
    slug: product.slug ?? null,
    description: product.description ?? null,
    price: Number(product.price ?? 0),
    shop_id: Number(product.shop_id ?? product.shopId ?? product.shop?.id ?? 0),
    category_id: Number(product.category_id ?? product.categoryId ?? product.category?.id ?? 0),
    status: product.status ?? "DRAFT",
    created_at: product.created_at ?? product.createdAt ?? nowIso,
    updated_at: product.updated_at ?? product.updatedAt ?? nowIso,
    deleted_at: product.deleted_at ?? product.deletedAt ?? null,
    shop: product.shop,
    category: product.category,
    variants,
    images,
    reviews: (product.reviews ?? []).map(normalizeReview),
    activeFlashSale: normalizeActiveFlashSale(product.activeFlashSale),
    attributes: product.attributes ?? [],
    tags: product.tags ?? [],
    stock: Number(product.stock ?? product.totalStock ?? 0),
    recommendationReason: product.recommendationReason,
  };
};
