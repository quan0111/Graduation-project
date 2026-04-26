// modules/admin/admin.type.ts
export interface IOrderFilter {
  status?: string;
  userId?: number;
  shopId?: number;
}

export interface ISellerFilter {
  isActive?: boolean;
  isVerified?: boolean;
}

export interface IPagination {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IDashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalShops: number;
  totalRevenue: number;
}