export type BannerStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";
export type BannerPosition =
  | "HOME_TOP"
  | "HOME_MIDDLE"
  | "HOME_BOTTOM"
  | "CATEGORY_TOP"
  | "PRODUCT_DETAIL";
export type BannerLayout =
  | "FULL"
  | "HALF"
  | "ONE_THIRD"
  | "TWO_THIRDS"
  | "ONE_QUARTER"
  | "THREE_QUARTERS";

export type Banner = {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  redirectUrl?: string | null;
  buttonText?: string | null;
  position: BannerPosition | string;
  layout?: BannerLayout | string | null;
  status: BannerStatus | string;
  priority: number;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerStats = {
  bannerId: number;
  clicks: number;
  views: number;
  ctr: number;
};

export type BannerCreatePayload = {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  redirectUrl?: string | null;
  buttonText?: string | null;
  position: BannerPosition;
  layout: BannerLayout;
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

export type FlashSaleBulkItemPayload = {
  productId: number;
  variantId?: number | null;
  shopId?: number | null;
  salePrice?: number | null;
};

export type FlashSaleBulkItemCreatePayload = {
  productIds?: number[];
  categoryIds?: number[];
  items?: FlashSaleBulkItemPayload[];
  discountPercent?: number | null;
  salePrice?: number | null;
  stockLimit?: number | null;
  purchaseLimit?: number | null;
};

export type FlashSaleBulkItemCreateResult = {
  productId: number;
  variantId?: number | null;
  action: "created" | "updated" | string;
};

export type FlashSaleBulkItemCreateError = {
  productId?: number | null;
  variantId?: number | null;
  reason: string;
};

export type FlashSaleBulkItemCreateResponse = {
  created: number;
  updated: number;
  skipped: number;
  results: FlashSaleBulkItemCreateResult[];
  errors: FlashSaleBulkItemCreateError[];
};
