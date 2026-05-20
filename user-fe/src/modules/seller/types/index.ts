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
  status:
    | "PENDING"
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "PAID"
    | "PAYMENT_FAILED"
    | "PAYMENT_EXPIRED"
    | "PROCESSING"
    | "READY_TO_SHIP"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCEL_REQUESTED"
    | "CANCELLED_BY_CUSTOMER"
    | "CANCELLED_BY_SELLER"
    | "CANCEL_REJECTED"
    | "CANCEL_APPROVED"
    | "CANCELLED"
    | "DELIVERY_FAILED"
    | "RETURN_TO_SENDER"
    | "RETURN_REQUESTED"
    | "RETURNED";
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
export type RegistrationStep = 'shop-info' | 'shipping' | 'identity' | 'tax' | 'complete'

export interface ShopInfo {
  shopName: string
  pickupAddress: string
  city: string
  district: string
  ward: string
  email: string
  phone: string
}

export interface IdentityInfo {
  fullName: string
  cccdFrontImage: File | null
  cccdBackImage: File | null
  cccdNumber: string
}

export interface TaxInfo {
  businessType: 'individual' | 'household' | 'company'
  businessRegistrationPlace: string
  registeredEmail: string
  taxNumber: string
  codEnabled: boolean
  dailyDeliveryEnabled: boolean
  expressDeliveryEnabled: boolean
  instantDeliveryEnabled: boolean
  buyNowPayLaterEnabled: boolean
}

export interface SellerRegistration {
  shopInfo: ShopInfo
  identityInfo: IdentityInfo
  taxInfo: TaxInfo
  currentStep: RegistrationStep
}
