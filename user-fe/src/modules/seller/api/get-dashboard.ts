import { isAxiosError } from "axios";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_LOGIN, API_URL_ORDER, API_URL_PRODUCT, API_URL_SHOP } from "@/constant/config";
import { apiClient } from "@/lib/api";

import type {
  SellerDashboardData,
  SellerDashboardInventoryItem,
  SellerDashboardOrderFlowItem,
  SellerDashboardRecentOrder,
  SellerDashboardShop,
  SellerDashboardTopProduct,
  SellerDashboardTrendPoint,
  SellerDashboardUser,
} from "../types/dashboard";

interface MeResponse {
  id: number;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: string;
}

interface ShopResponse {
  id: number;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  productCount?: number;
}

interface ProductImageResponse {
  url: string;
  isPrimary?: boolean;
}

interface ProductVariantResponse {
  id: number;
  sku?: string | null;
  stock: number;
}

interface ProductResponse {
  id: number;
  name: string;
  price: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  images?: ProductImageResponse[];
  variants?: ProductVariantResponse[];
}

interface PaymentResponse {
  status?: string;
}

interface OrderItemResponse {
  id: number;
  productId: number;
  shopId: number;
  quantity: number;
  price: number;
  productName?: string;
}

interface OrderResponse {
  id: number;
  status: string;
  createdAt: string;
  items?: OrderItemResponse[];
  payment?: PaymentResponse;
}

interface ShopScopedOrder {
  id: number;
  status: string;
  createdAt: string;
  paymentStatus?: string;
  itemCount: number;
  revenue: number;
  items: OrderItemResponse[];
}

interface ShopScopedProduct {
  id: number;
  name: string;
  price: number;
  status: string;
  updatedAt: string;
  totalStock: number;
  sku: string;
}

function createEmptyDashboard(
  accessState: SellerDashboardData["accessState"],
  user: SellerDashboardUser | null,
  shop: SellerDashboardShop | null = null
): SellerDashboardData {
  return {
    accessState,
    user,
    shop,
    overview: {
      grossRevenue: 0,
      totalOrders: 0,
      activeProducts: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      completionRate: 0,
    },
    salesTrend: buildTrend([]),
    todo: {
      pending: 0,
      processing: 0,
      shipping: 0,
      returns: 0,
    },
    orderFlow: buildOrderFlow({ pending: 0, processing: 0, shipping: 0, completed: 0 }),
    wallet: {
      grossRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
      cancelledRevenue: 0,
    },
    topProducts: [],
    inventory: [],
    recentOrders: [],
  };
}

async function getProfile() {
  const response = await apiClient.get<MeResponse>(`${API_URL_LOGIN}/me`);
  return response.data;
}

async function getMyShop() {
  const response = await apiClient.get<ShopResponse>(`${API_URL_SHOP}/me`);
  return response.data;
}

async function getShopProducts(shopId: number) {
  const response = await apiClient.get<ProductResponse[]>(`${API_URL_PRODUCT}/products-by-shop/${shopId}/`);
  return response.data;
}

async function getOrders() {
  const response = await apiClient.get<OrderResponse[]>(API_URL_ORDER);
  return response.data;
}

function normalizeUser(data: MeResponse): SellerDashboardUser {
  return {
    id: data.id,
    email: data.email,
    fullName: data.fullName,
    avatarUrl: data.avatarUrl,
    role: data.role,
  };
}

function normalizeShop(data: ShopResponse): SellerDashboardShop {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    avatarUrl: data.avatarUrl,
    productCount: data.productCount ?? 0,
  };
}

function normalizeProducts(products: ProductResponse[]): ShopScopedProduct[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    status: product.status,
    updatedAt: product.updatedAt ?? product.createdAt,
    totalStock: (product.variants ?? []).reduce((sum, variant) => sum + (variant.stock ?? 0), 0),
    sku: (product.variants ?? []).find((variant) => variant.sku)?.sku ?? `SP-${product.id}`,
  }));
}

function normalizeOrders(orders: OrderResponse[], shopId: number): ShopScopedOrder[] {
  return orders
    .map((order) => {
      const shopItems = (order.items ?? []).filter((item) => item.shopId === shopId);
      const revenue = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = shopItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        paymentStatus: order.payment?.status,
        itemCount,
        revenue,
        items: shopItems,
      };
    })
    .filter((order) => order.items.length > 0);
}

function buildTrend(orders: ShopScopedOrder[]): SellerDashboardTrendPoint[] {
  const formatter = new Intl.DateTimeFormat("vi-VN", { weekday: "short" });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((day) => {
    const dayKey = day.toISOString().slice(0, 10);
    const dayOrders = orders.filter((order) => order.createdAt.slice(0, 10) === dayKey);

    return {
      label: formatter.format(day),
      revenue: dayOrders.reduce((sum, order) => sum + order.revenue, 0),
      orders: dayOrders.length,
    };
  });
}

function buildOrderBuckets(orders: ShopScopedOrder[]) {
  return orders.reduce(
    (accumulator, order) => {
      if (order.status === "PENDING") {
        accumulator.pending += 1;
      } else if (["CONFIRMED", "PAID", "PROCESSING", "READY_TO_SHIP"].includes(order.status)) {
        accumulator.processing += 1;
      } else if (["SHIPPED", "IN_TRANSIT"].includes(order.status)) {
        accumulator.shipping += 1;
      } else if (["RETURN_REQUESTED", "RETURNED"].includes(order.status)) {
        accumulator.returns += 1;
      } else if (["DELIVERED", "COMPLETED"].includes(order.status)) {
        accumulator.completed += 1;
      } else if (order.status === "CANCELLED") {
        accumulator.cancelled += 1;
      }

      return accumulator;
    },
    {
      pending: 0,
      processing: 0,
      shipping: 0,
      returns: 0,
      completed: 0,
      cancelled: 0,
    }
  );
}

function buildOrderFlow(buckets: {
  pending: number;
  processing: number;
  shipping: number;
  completed: number;
}): SellerDashboardOrderFlowItem[] {
  const maxValue = Math.max(
    buckets.pending,
    buckets.processing,
    buckets.shipping,
    buckets.completed,
    1
  );

  return [
    { label: "Chờ xác nhận", count: buckets.pending, progress: Math.round((buckets.pending / maxValue) * 100) },
    { label: "Đang xử lý", count: buckets.processing, progress: Math.round((buckets.processing / maxValue) * 100) },
    { label: "Đang giao", count: buckets.shipping, progress: Math.round((buckets.shipping / maxValue) * 100) },
    { label: "Hoàn tất", count: buckets.completed, progress: Math.round((buckets.completed / maxValue) * 100) },
  ];
}

function buildTopProducts(
  products: ShopScopedProduct[],
  orders: ShopScopedOrder[]
): SellerDashboardTopProduct[] {
  const statsByProduct = new Map<number, { sold: number; revenue: number }>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const current = statsByProduct.get(item.productId) ?? { sold: 0, revenue: 0 };

      current.sold += item.quantity;
      current.revenue += item.quantity * item.price;

      statsByProduct.set(item.productId, current);
    });
  });

  return products
    .map((product) => {
      const stats = statsByProduct.get(product.id) ?? { sold: 0, revenue: 0 };

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        sold: stats.sold,
        stock: product.totalStock,
        revenue: stats.revenue,
        status: product.status,
      };
    })
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 5);
}

function buildInventory(products: ShopScopedProduct[]): SellerDashboardInventoryItem[] {
  return [...products]
    .sort((left, right) => left.totalStock - right.totalStock)
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.totalStock,
      price: product.price,
      status: product.status,
      updatedAt: product.updatedAt,
    }));
}

function buildRecentOrders(orders: ShopScopedOrder[]): SellerDashboardRecentOrder[] {
  return [...orders]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 6)
    .map((order) => ({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.itemCount,
      revenue: order.revenue,
      paymentStatus: order.paymentStatus,
    }));
}

export const getSellerDashboard = async (): Promise<SellerDashboardData> => {
  const me = normalizeUser(await getProfile());

  if (me.role !== "SELLER") {
    return createEmptyDashboard("not-seller", me);
  }

  let shop: SellerDashboardShop;

  try {
    shop = normalizeShop(await getMyShop());
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return createEmptyDashboard("no-shop", me);
    }

    throw error;
  }

  const [productsResponse, ordersResponse] = await Promise.all([
    getShopProducts(shop.id),
    getOrders(),
  ]);

  const products = normalizeProducts(productsResponse);
  const orders = normalizeOrders(ordersResponse, shop.id);
  const orderBuckets = buildOrderBuckets(orders);
  const grossRevenue = orders.reduce((sum, order) => sum + order.revenue, 0);
  const pendingRevenue = orders
    .filter((order) => !["DELIVERED", "COMPLETED", "CANCELLED", "RETURNED"].includes(order.status))
    .reduce((sum, order) => sum + order.revenue, 0);
  const completedRevenue = orders
    .filter((order) => ["DELIVERED", "COMPLETED"].includes(order.status))
    .reduce((sum, order) => sum + order.revenue, 0);
  const cancelledRevenue = orders
    .filter((order) => order.status === "CANCELLED")
    .reduce((sum, order) => sum + order.revenue, 0);
  const lowStockProducts = products.filter((product) => product.totalStock > 0 && product.totalStock <= 10).length;
  const outOfStockProducts = products.filter((product) => product.totalStock <= 0).length;
  const activeProducts = products.filter((product) => product.status === "ACTIVE" && product.totalStock > 0).length;
  const totalOrders = orders.length;
  const pendingOrders = orderBuckets.pending + orderBuckets.processing;
  const completionBase = totalOrders - orderBuckets.cancelled;
  const completionRate = completionBase > 0 ? Math.round((orderBuckets.completed / completionBase) * 100) : 0;

  return {
    accessState: "ready",
    user: me,
    shop: {
      ...shop,
      productCount: shop.productCount || products.length,
    },
    overview: {
      grossRevenue,
      totalOrders,
      activeProducts,
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
      completionRate,
    },
    salesTrend: buildTrend(orders),
    todo: {
      pending: orderBuckets.pending,
      processing: orderBuckets.processing,
      shipping: orderBuckets.shipping,
      returns: orderBuckets.returns,
    },
    orderFlow: buildOrderFlow(orderBuckets),
    wallet: {
      grossRevenue,
      completedRevenue,
      pendingRevenue,
      cancelledRevenue,
    },
    topProducts: buildTopProducts(products, orders),
    inventory: buildInventory(products),
    recentOrders: buildRecentOrders(orders),
  };
};

export const useGetSellerDashboard = (
  config?: Omit<
    UseQueryOptions<SellerDashboardData, Error, SellerDashboardData, [string, string]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<SellerDashboardData, Error, SellerDashboardData, [string, string]>({
    queryKey: ["seller", "dashboard"],
    queryFn: getSellerDashboard,
    staleTime: 1000 * 60 * 2,
    ...config,
  });
};
