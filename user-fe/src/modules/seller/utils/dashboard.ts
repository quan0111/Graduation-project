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
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getOrderStatusLabel(status: string) {
  return orderStatusLabelMap[status] ?? status;
}

export function getOrderStatusTone(status: string) {
  return orderStatusToneMap[status] ?? "bg-slate-100 text-slate-700";
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
