export type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "NEED_MORE_INFO";

// ================= SHORT =================
export interface IUserShort {
  id: number;
  email: string;
}

export interface IShopShort {
  id: number;
  name: string;
}

// ================= MAIN =================
export interface ISellerApplication {
  id: number;
  userId: number;

  shopName: string;
  shopSlug?: string | null;
  description?: string | null;

  logoUrl?: string | null;
  coverUrl?: string | null;

  businessPhone?: string | null;
  businessEmail?: string | null;
  taxCode?: string | null;
  identityFullName?: string | null;
  identityNumber?: string | null;
  identityFrontUrl?: string | null;
  identityBackUrl?: string | null;
  shippingOptions?: Record<string, unknown> | null;
  taxInfo?: Record<string, unknown> | null;

  addressLine?: string | null;
  ward?: string | null;
  district?: string | null;
  province?: string | null;

  status: ApplicationStatus;
  note?: string | null;

  reviewedById?: number | null;
  reviewedAt?: string | null;

  createdAt: string;
  updatedAt: string;

  // 🔥 RELATION
  user?: IUserShort;
  shop?: IShopShort;
  reviewedBy?: IUserShort;
}

// ================= CREATE =================
export interface ISellerCreate {
  shopName: string;
  shopSlug?: string;

  description?: string;

  logoUrl?: string;
  coverUrl?: string;

  businessPhone?: string;
  businessEmail?: string;
  taxCode?: string;
  identityFullName?: string;
  identityNumber?: string;
  identityFrontUrl?: string;
  identityBackUrl?: string;
  shippingOptions?: Record<string, unknown>;
  taxInfo?: Record<string, unknown>;

  addressLine?: string;
  ward?: string;
  district?: string;
  province?: string;
}

// ================= UPDATE =================
export interface ISellerUpdate {
  status?: ApplicationStatus;
  note?: string;
}
