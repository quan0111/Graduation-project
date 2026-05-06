import type { OrderStatusType } from "@/constant";

import type { IOrder, IOrderAddress } from "../types";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatDateTime = (value?: string | null) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatShortDate = (value?: string | null) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

export const joinAddress = (address?: IOrderAddress | null) => {
  if (!address) return "Chưa có địa chỉ giao hàng";

  return [
    address.address_line,
    address.ward,
    address.district,
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

export const orderStatusMeta: Record<
  OrderStatusType,
  { label: string; tone: string; chip: string }
> = {
  pending: {
    label: "Chờ xác nhận",
    tone: "text-amber-700",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    tone: "text-sky-700",
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  paid: {
    label: "Đã thanh toán",
    tone: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  processing: {
    label: "Đang chuẩn bị",
    tone: "text-orange-700",
    chip: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  ready_to_ship: {
    label: "Sẵn sàng giao",
    tone: "text-indigo-700",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  shipped: {
    label: "Đã gửi hàng",
    tone: "text-blue-700",
    chip: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  in_transit: {
    label: "Đang vận chuyển",
    tone: "text-cyan-700",
    chip: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  delivered: {
    label: "Đã giao hàng",
    tone: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  completed: {
    label: "Hoàn tất",
    tone: "text-teal-700",
    chip: "bg-teal-50 text-teal-700 ring-teal-200",
  },
  cancelled: {
    label: "Đã hủy",
    tone: "text-rose-700",
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  return_requested: {
    label: "Yêu cầu trả hàng",
    tone: "text-fuchsia-700",
    chip: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  },
  returned: {
    label: "Đã trả hàng",
    tone: "text-slate-700",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

export const getStatusMeta = (status: OrderStatusType) =>
  orderStatusMeta[status] ?? orderStatusMeta.pending;

export const getOrderVisibleSubtotal = (order: IOrder) =>
  order.items.reduce((sum, item) => sum + item.line_total, 0);

export const getTrackingSteps = (status: OrderStatusType) => {
  const steps = [
    "pending",
    "processing",
    "ready_to_ship",
    "shipped",
    "in_transit",
    "delivered",
    "completed",
  ] as OrderStatusType[];

  const index = steps.indexOf(status);
  return steps.map((step, stepIndex) => ({
    key: step,
    active: index >= 0 && stepIndex <= index,
    ...getStatusMeta(step),
  }));
};
