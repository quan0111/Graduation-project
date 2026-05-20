export type BannerStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";
export type BannerPosition =
  | "HOME_TOP"
  | "HOME_MIDDLE"
  | "HOME_BOTTOM"
  | "CATEGORY_TOP"
  | "PRODUCT_DETAIL";

export type Banner = {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  redirectUrl?: string | null;
  buttonText?: string | null;
  position: BannerPosition | string;
  status: BannerStatus | string;
  priority: number;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerCreatePayload = {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  redirectUrl?: string | null;
  buttonText?: string | null;
  position: BannerPosition;
  status: BannerStatus;
  priority: number;
  startAt?: string | null;
  endAt?: string | null;
};

export type FlashSaleStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";

export type FlashSaleItem = {
  id: number;
  flashSaleId: number;
  productId: number;
  variantId?: number | null;
  shopId: number;
  salePrice: number;
  stockLimit?: number | null;
  soldCount: number;
  purchaseLimit?: number | null;
  createdAt?: string;
};

export type FlashSale = {
  id: number;
  name: string;
  startsAt: string;
  endsAt: string;
  status: FlashSaleStatus | string;
  createdAt?: string;
  updatedAt?: string;
  items?: FlashSaleItem[];
};

export type FlashSaleCreatePayload = {
  name: string;
  startsAt: string;
  endsAt: string;
  status: FlashSaleStatus;
};

export type FlashSaleUpdatePayload = Partial<FlashSaleCreatePayload>;

export type FlashSaleItemCreatePayload = {
  productId: number;
  variantId?: number | null;
  shopId: number;
  salePrice: number;
  stockLimit?: number | null;
  purchaseLimit?: number | null;
};
