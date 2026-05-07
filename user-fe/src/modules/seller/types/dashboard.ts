export type SellerDashboardAccessState = "ready" | "not-seller" | "no-shop";

export interface SellerDashboardUser {
  id: number;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: string;
}

export interface SellerDashboardShop {
  id: number;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  productCount: number;
}

export interface SellerDashboardOverview {
  grossRevenue: number;
  totalOrders: number;
  activeProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  completionRate: number;
}

export interface SellerDashboardTrendPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface SellerDashboardTodo {
  pending: number;
  processing: number;
  shipping: number;
  returns: number;
}

export interface SellerDashboardOrderFlowItem {
  label: string;
  count: number;
  progress: number;
}

export interface SellerDashboardWallet {
  grossRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  cancelledRevenue: number;
}

export interface SellerDashboardTopProduct {
  id: number;
  variantId?: number;
  name: string;
  sku: string;
  sold: number;
  stock: number;
  price: number;
  revenue: number;
  status: string;
}

export interface SellerDashboardInventoryItem {
  id: number;
  variantId?: number;
  name: string;
  stock: number;
  price: number;
  status: string;
  updatedAt: string;
}

export interface SellerDashboardRecentOrder {
  id: number;
  status: string;
  createdAt: string;
  itemCount: number;
  revenue: number;
  paymentStatus?: string;
}

export interface SellerDashboardData {
  accessState: SellerDashboardAccessState;
  user: SellerDashboardUser | null;
  shop: SellerDashboardShop | null;
  overview: SellerDashboardOverview;
  salesTrend: SellerDashboardTrendPoint[];
  todo: SellerDashboardTodo;
  orderFlow: SellerDashboardOrderFlowItem[];
  wallet: SellerDashboardWallet;
  topProducts: SellerDashboardTopProduct[];
  inventory: SellerDashboardInventoryItem[];
  recentOrders: SellerDashboardRecentOrder[];
}
