import { formatShortDateTime as formatShortDateTimeValue } from "@/lib/date";

const orderStatusLabelMap: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  READY_TO_SHIP: "Chờ giao vận",
  SHIPPED: "Đã gửi hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  RETURN_REQUESTED: "Yêu cầu trả hàng",
  RETURNED: "Đã hoàn hàng",
};

const orderStatusToneMap: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PAID: "bg-sky-50 text-sky-700",
  PROCESSING: "bg-indigo-50 text-indigo-700",
  READY_TO_SHIP: "bg-cyan-50 text-cyan-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  IN_TRANSIT: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  RETURN_REQUESTED: "bg-orange-50 text-orange-700",
  RETURNED: "bg-orange-50 text-orange-700",
};

const productStatusLabelMap: Record<string, string> = {
  ACTIVE: "Đang bán",
  DRAFT: "Bản nháp",
  OUT_OF_STOCK: "Hết hàng",
  BANNED: "Bị khóa",
  REJECT: "Bị từ chối",
  APPROVAL: "Chờ duyệt",
};

const productStatusToneMap: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-slate-100 text-slate-700",
  OUT_OF_STOCK: "bg-rose-50 text-rose-700",
  BANNED: "bg-rose-50 text-rose-700",
  REJECT: "bg-rose-50 text-rose-700",
  APPROVAL: "bg-amber-50 text-amber-700",
};

const orderStatusLabelOverrides: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAYMENT_FAILED: "Thanh toán thất bại",
  PAYMENT_EXPIRED: "Hết hạn thanh toán",
  OUT_FOR_DELIVERY: "Đang giao hàng",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  CANCELLED_BY_CUSTOMER: "Khách đã hủy",
  CANCELLED_BY_SELLER: "Seller đã hủy",
  CANCEL_REJECTED: "Từ chối hủy",
  CANCEL_APPROVED: "Đã duyệt hủy",
  DELIVERY_FAILED: "Giao thất bại",
  RETURN_TO_SENDER: "Hoàn về seller",
};

const orderStatusToneOverrides: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700",
  PAYMENT_FAILED: "bg-rose-50 text-rose-700",
  PAYMENT_EXPIRED: "bg-rose-50 text-rose-700",
  OUT_FOR_DELIVERY: "bg-violet-50 text-violet-700",
  CANCEL_REQUESTED: "bg-orange-50 text-orange-700",
  CANCELLED_BY_CUSTOMER: "bg-rose-50 text-rose-700",
  CANCELLED_BY_SELLER: "bg-rose-50 text-rose-700",
  CANCEL_REJECTED: "bg-slate-100 text-slate-700",
  CANCEL_APPROVED: "bg-orange-50 text-orange-700",
  DELIVERY_FAILED: "bg-red-50 text-red-700",
  RETURN_TO_SENDER: "bg-red-50 text-red-700",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatShortDateTime(value: string) {
  return formatShortDateTimeValue(value);
}

export function getOrderStatusLabel(status: string) {
  return orderStatusLabelOverrides[status] ?? orderStatusLabelMap[status] ?? status;
}

export function getOrderStatusTone(status: string) {
  return orderStatusToneOverrides[status] ?? orderStatusToneMap[status] ?? "bg-slate-100 text-slate-700";
}

export function getProductStatusLabel(status: string, stock: number) {
  if (stock <= 0) {
    return productStatusLabelMap.OUT_OF_STOCK;
  }

  return productStatusLabelMap[status] ?? status;
}

export function getProductStatusTone(status: string, stock: number) {
  if (stock <= 0) {
    return productStatusToneMap.OUT_OF_STOCK;
  }

  return productStatusToneMap[status] ?? "bg-slate-100 text-slate-700";
}
