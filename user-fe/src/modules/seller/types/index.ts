// Seller module types

export interface IShop {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  cover?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface IProductCreate {
  name: string;
  description: string;
  price: number;
  category_id: number;
  shop_id: number;
  images?: string[];
  variants?: IVariantCreate[];
  attributes?: IAttributeCreate[];
  tags?: string[];
  stock?: number;
}

export interface IVariantCreate {
  name: string;
  price?: number;
  stock?: number;
  sku?: string;
}

export interface IAttributeCreate {
  key: string;
  value: string;
}

export interface ISellerDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface ISellerOrder {
  id: number;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  created_at: string;
  items: ISellerOrderItem[];
}

export interface ISellerOrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
}