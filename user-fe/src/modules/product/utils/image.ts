import type { IProduct } from "@/modules/product/types";

type ImageLike = {
  url?: string | null;
  position?: number | null;
  is_primary?: boolean;
  isPrimary?: boolean;
  deleted_at?: string | null;
  deletedAt?: string | null;
};

const isVisibleImage = (image?: ImageLike | null): image is ImageLike =>
  Boolean(image?.url) && !image?.deleted_at && !image?.deletedAt;

const byPosition = (left: ImageLike, right: ImageLike) => Number(left.position || 0) - Number(right.position || 0);
const isPrimaryImage = (image: ImageLike) => Boolean(image.is_primary || image.isPrimary);

export const getProductImageUrl = (product: IProduct, fallback = "/placeholder.png") => {
  const productImages = [...(product.images ?? [])].filter(isVisibleImage).sort(byPosition);
  const primaryImage = productImages.find(isPrimaryImage);
  if (primaryImage?.url) {
    return primaryImage.url;
  }

  if (productImages[0]?.url) {
    return productImages[0].url;
  }

  const variantImages =
    product.variants
      ?.flatMap((variant) => variant.variantImages ?? variant.images ?? [])
      .filter(isVisibleImage)
      .sort(byPosition) ?? [];

  return variantImages[0]?.url ?? fallback;
};
