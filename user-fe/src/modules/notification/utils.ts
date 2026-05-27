import type { Notification } from "@/modules/notification/api/notification";

const notificationTypeLabels: Record<string, string> = {
  ORDER_UPDATE: "Đơn hàng",
  PAYMENT_UPDATE: "Thanh toán",
  RETURN_UPDATE: "Đổi trả",
  REFUND_UPDATE: "Hoàn tiền",
  PRODUCT_BANNED: "Sản phẩm",
  SUPPORT_TICKET: "Hỗ trợ",
  SYSTEM: "Hệ thống",
  PROMOTION: "Khuyến mãi",
  CHAT: "Tin nhắn",
};

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PENDING_PAYMENT: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CREATED: "Đã tạo",
  PAID: "Đã thanh toán",
  PAYMENT_FAILED: "Thanh toán thất bại",
  PAYMENT_EXPIRED: "Hết hạn thanh toán",
  PROCESSING: "Đang xử lý",
  READY_TO_SHIP: "Sẵn sàng giao hàng",
  SHIPPED: "Đã giao cho đơn vị vận chuyển",
  IN_TRANSIT: "Đang vận chuyển",
  OUT_FOR_DELIVERY: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  COMPLETED: "Hoàn tất",
  CANCEL_REQUESTED: "Đang chờ duyệt hủy",
  CANCELLED_BY_CUSTOMER: "Người mua đã hủy",
  CANCELLED_BY_SELLER: "Người bán đã hủy",
  CANCEL_REJECTED: "Yêu cầu hủy bị từ chối",
  CANCEL_APPROVED: "Yêu cầu hủy được duyệt",
  CANCELLED: "Đã hủy",
  DELIVERY_FAILED: "Giao hàng thất bại",
  RETURN_TO_SENDER: "Hoàn về người bán",
  RETURN_REQUESTED: "Đang yêu cầu trả hàng",
  RETURNED: "Đã trả hàng",

  SUCCESS: "Thành công",
  PAYMENT_SUCCESS: "Thanh toán thành công",
  FAILED: "Thất bại",
  REFUNDING: "Đang hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  REFUND_FAILED: "Hoàn tiền thất bại",
  PARTIALLY_REFUNDED: "Đã hoàn tiền một phần",

  REQUESTED: "Chờ duyệt",
  REQUEST_RETURN: "Yêu cầu trả hàng",
  SELLER_REVIEW: "Người bán đang xem xét",
  APPROVED: "Đã duyệt",
  RETURN_APPROVED: "Đồng ý trả hàng",
  REJECTED: "Bị từ chối",
  RETURN_REJECTED: "Từ chối yêu cầu",
  CUSTOMER_APPEAL: "Khách hàng khiếu nại",
  ADMIN_REVIEW: "Admin đang xem xét",
  REFUND_APPROVED: "Duyệt hoàn tiền",
  REFUND_REJECTED: "Từ chối hoàn tiền",
  PICKED_UP: "Đã lấy hàng",
  PICKUP_RETURN_IN_TRANSIT: "Đang trả hàng",
  RECEIVED: "Shop đã nhận hàng",
  RETURN_RECEIVED: "Shop đã nhận hàng",

  DRAFT: "Bản nháp",
  APPROVAL: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  OUT_OF_STOCK: "Hết hàng",
  BANNED: "Bị cấm bán",
  REJECT: "Bị từ chối",

  OPEN: "Đang mở",
  WAITING_SELLER: "Chờ shop phản hồi",
  WAITING_CUSTOMER: "Chờ khách hàng phản hồi",
  RESOLVED: "Đã xử lý",
  CLOSED: "Đã đóng",
};

const readMetadata = (metadata: unknown): Record<string, unknown> => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
};

const readId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const readString = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : "");

const readIdList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(readId).filter((id): id is number => Boolean(id));
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getVietnameseStatus = (status: unknown) => {
  if (status === null || status === undefined || status === "") {
    return "";
  }

  const key = String(status).trim().toUpperCase();
  return statusLabels[key] ?? String(status);
};

export const translateStatusTokens = (text: string) =>
  Object.keys(statusLabels)
    .sort((left, right) => right.length - left.length)
    .reduce((current, key) => current.replace(new RegExp(`\\b${escapeRegex(key)}\\b`, "g"), statusLabels[key]), text);

export const getNotificationTarget = (notification: Notification, role?: string | null) => {
  const metadata = readMetadata(notification.metadata);
  const explicitHref = typeof metadata.href === "string" ? metadata.href : "";
  if (explicitHref.startsWith("/")) {
    return explicitHref;
  }

  const isSeller = role === "SELLER";
  const orderId = readId(metadata.orderId);
  const orderIds = readIdList(metadata.orderIds);
  const checkoutGroupCode = readString(metadata.checkoutGroupCode);
  const returnId = readId(metadata.returnId);
  const productId = readId(metadata.productId);
  const ticketId = readId(metadata.ticketId);

  switch (notification.type) {
    case "ORDER_UPDATE":
    case "PAYMENT_UPDATE":
      if (!isSeller && checkoutGroupCode && orderIds.length > 1) {
        return `/orders?checkoutGroup=${encodeURIComponent(checkoutGroupCode)}`;
      }
      return orderId ? (isSeller ? `/seller/orders/${orderId}` : `/orders/${orderId}`) : isSeller ? "/seller/orders" : "/orders";
    case "RETURN_UPDATE":
    case "REFUND_UPDATE":
      return isSeller
        ? `/seller/returns${returnId ? `?returnId=${returnId}` : ""}`
        : `/returns${returnId ? `?returnId=${returnId}` : ""}`;
    case "SUPPORT_TICKET":
    case "CHAT":
      return isSeller
        ? `/seller/support${ticketId ? `?ticketId=${ticketId}` : ""}`
        : `/messages${ticketId ? `?ticketId=${ticketId}` : ""}`;
    case "PRODUCT_BANNED":
      return isSeller ? `/seller/products${productId ? `?productId=${productId}` : ""}` : productId ? `/product/${productId}` : "/products";
    case "PROMOTION":
      return "/promotions";
    case "SYSTEM":
      if (productId) {
        return isSeller ? `/seller/products?productId=${productId}` : `/product/${productId}`;
      }
      if (metadata.shopId) {
        return isSeller ? "/seller/settings" : "/";
      }
      return "/profile";
    default:
      return undefined;
  }
};

export const buildNotificationDisplay = (notification: Notification, role?: string | null) => {
  const metadata = readMetadata(notification.metadata);
  const statusLabel = getVietnameseStatus(metadata.status);
  const orderId = readId(metadata.orderId);
  const orderIds = readIdList(metadata.orderIds);
  const checkoutGroupCode = readString(metadata.checkoutGroupCode);
  const returnId = readId(metadata.returnId);
  const productId = readId(metadata.productId);
  const ticketId = readId(metadata.ticketId);
  const productName = typeof metadata.productName === "string" ? metadata.productName : "";

  let title = translateStatusTokens(notification.title);
  let content = translateStatusTokens(notification.content);

  if (notification.type === "ORDER_UPDATE" && checkoutGroupCode && orderIds.length > 1 && statusLabel) {
    title = "Thanh toán thành công";
    content = `Thanh toán thành công ${orderIds.length} hóa đơn trong cùng lần checkout. Nhấn để xem nhóm hóa đơn.`;
  } else if (notification.type === "ORDER_UPDATE" && orderId && statusLabel) {
    title = "Cập nhật đơn hàng";
    content = `Đơn hàng #${orderId} hiện ở trạng thái ${statusLabel}. Nhấn để xem chi tiết đơn hàng.`;
  }

  if (notification.type === "PAYMENT_UPDATE" && orderId && statusLabel) {
    title = "Cập nhật thanh toán";
    content = `Thanh toán của đơn hàng #${orderId}: ${statusLabel}. Nhấn để xem chi tiết đơn hàng.`;
  }

  if ((notification.type === "RETURN_UPDATE" || notification.type === "REFUND_UPDATE") && statusLabel) {
    title = notification.type === "REFUND_UPDATE" ? "Cập nhật hoàn tiền" : "Cập nhật đổi trả";
    content = `Yêu cầu đổi trả${returnId ? ` #${returnId}` : ""}${orderId ? ` của đơn hàng #${orderId}` : ""} hiện ở trạng thái ${statusLabel}.`;
  }

  if (notification.type === "PRODUCT_BANNED" && statusLabel) {
    title = "Cập nhật sản phẩm";
    content = `Sản phẩm ${productName ? `"${productName}"` : productId ? `#${productId}` : "của bạn"} hiện ở trạng thái ${statusLabel}.`;
  }

  if ((notification.type === "SUPPORT_TICKET" || notification.type === "CHAT") && ticketId) {
    title = "Cập nhật hỗ trợ";
    content = `Ticket hỗ trợ #${ticketId} vừa có cập nhật mới. Nhấn để mở cuộc trao đổi.`;
  }

  return {
    title,
    content,
    statusLabel,
    typeLabel: notificationTypeLabels[notification.type] ?? translateStatusTokens(notification.type),
    href: getNotificationTarget(notification, role),
  };
};
