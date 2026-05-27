import type { IActiveFlashSale, IProduct, IProductImage, IProductVariant, IVariantImage } from "@/modules/product/types";

type UnknownRecord = Record<string, any>;

const nowIso = new Date().toISOString();
const byPosition = <T extends { position?: number }>(left: T, right: T) => Number(left.position || 0) - Number(right.position || 0);

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

const normalizeImage = (image: UnknownRecord | string): IProductImage => {
  const value = typeof image === "string" ? { url: image } : image;

  return {
    id: Number(value.id ?? 0),
    url: value.url ?? value.imageUrl ?? value.image_url ?? "",
    position: Number(value.position ?? 0),
    is_primary: Boolean(value.is_primary ?? value.isPrimary ?? false),
    product_id: Number(value.product_id ?? value.productId ?? 0),
    created_at: value.created_at ?? value.createdAt ?? nowIso,
    deleted_at: value.deleted_at ?? value.deletedAt ?? null,
  };
};

const normalizeVariantImage = (image: UnknownRecord | string): IVariantImage => {
  const value = typeof image === "string" ? { url: image } : image;

  return {
    id: Number(value.id ?? 0),
    url: value.url ?? value.imageUrl ?? value.image_url ?? "",
    position: Number(value.position ?? 0),
    variant_id: Number(value.variant_id ?? value.variantId ?? 0),
    created_at: value.created_at ?? value.createdAt ?? nowIso,
    deleted_at: value.deleted_at ?? value.deletedAt ?? null,
  };
};

const normalizeVariant = (variant: UnknownRecord): IProductVariant => {
  const variantImages = (variant.images ?? variant.variantImages ?? variant.variant_images ?? variant.VariantImage ?? [])
    .map(normalizeVariantImage)
    .filter((image: IVariantImage) => image.url && !image.deleted_at)
    .sort(byPosition);

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
  const images = (product.images ?? product.Images ?? [])
    .map(normalizeImage)
    .filter((image: IProductImage) => image.url && !image.deleted_at)
    .sort(byPosition);
  const variants = (product.variants ?? [])
    .map(normalizeVariant)
    .filter((variant: IProductVariant) => !variant.deleted_at);

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
