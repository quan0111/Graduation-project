import type {
  IOrder,
  IOrderAddress,
  IOrderItem,
  IOrderShop,
  IOrderUser,
  IPayment,
  IShipment,
} from "../types";

const toLowerStatus = <T extends string>(value?: string | null) =>
  (value ? value.toLowerCase() : "") as T;

const mapUser = (user: any): IOrderUser | null =>
  user
    ? {
      id: user.id,
      email: user.email,
      full_name: user.fullName ?? null,
    }
    : null;

const mapAddress = (address: any): IOrderAddress | null =>
  address
    ? {
      id: address.id,
      user_id: address.userId,
      full_name: address.fullName,
      phone: address.phone,
      address_line: address.addressLine,
      ward: address.ward ?? null,
      district: address.district,
      province: address.province,
      country: address.country ?? null,
      postal_code: address.postalCode ?? null,
      is_default: Boolean(address.isDefault),
    }
    : null;

const mapShop = (shop: any): IOrderShop | undefined =>
  shop
    ? {
      id: shop.id,
      name: shop.name,
    }
    : undefined;

const mapPayment = (payment: any): IPayment | null =>
  payment
    ? {
      id: payment.id,
      order_id: payment.orderId,
      method: payment.method,
      status: toLowerStatus<IPayment["status"]>(payment.status),
      amount: payment.amount ?? null,
      provider_order_id: payment.providerOrderId ?? null,
      request_id: payment.requestId ?? null,
      transaction_id: payment.transactionId ?? null,
      payment_url: payment.paymentUrl ?? null,
      qr_code_url: payment.qrCodeUrl ?? null,
      deeplink: payment.deeplink ?? null,
      provider_message: payment.providerMessage ?? null,
      paid_at: payment.paidAt ?? null,
      created_at: payment.createdAt,
      updated_at: payment.updatedAt ?? null,
    }
    : null;

const mapShipment = (shipment: any): IShipment | null =>
  shipment
    ? {
      id: shipment.id,
      order_id: shipment.orderId,
      carrier: shipment.carrier ?? null,
      tracking_number: shipment.trackingNumber ?? null,
      status: toLowerStatus<IShipment["status"]>(shipment.status),
      shipped_at: shipment.shippedAt ?? null,
      delivered_at: shipment.deliveredAt ?? null,
      created_at: shipment.createdAt,
    }
    : null;

const mapItem = (item: any): IOrderItem => ({
  id: item.id,
  order_id: item.orderId,
  product_id: item.productId,
  variant_id: item.variantId ?? null,
  shop_id: item.shopId,
  quantity: item.quantity,
  price: item.price,
  product_name: item.productName ?? "Sản phẩm",
  variant_name: item.variantName ?? null,
  product_image: item.productImage ?? null,
  line_total: item.price * item.quantity,
  shop: mapShop(item.shop),
});

export const mapOrder = (order: any): IOrder => ({
  id: order.id,
  user_id: order.userId,
  status: toLowerStatus<IOrder["status"]>(order.status),
  subtotal: order.subtotal,
  shipping_fee: order.shippingFee,
  discount_amount: order.discountAmount,
  total_amount: order.totalAmount,
  shipping_address_id: order.shippingAddressId ?? null,
  coupon_id: order.couponId ?? null,
  created_at: order.createdAt,
  updated_at: order.updatedAt,
  user: mapUser(order.user),
  shipping_address: mapAddress(order.shippingAddress),
  shipment: mapShipment(order.shipment),
  items: Array.isArray(order.items) ? order.items.map(mapItem) : [],
  payment: mapPayment(order.payment),
});
