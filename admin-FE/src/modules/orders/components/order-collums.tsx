import { OrderActions } from "./order-action";
import { formatCurrency } from "../utils/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/date";

export const statusOptions = [
  { value: "PENDING", label: "Chờ xử lý", color: "bg-yellow-500" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán", color: "bg-yellow-500" },
  { value: "CONFIRMED", label: "Đã xác nhận", color: "bg-blue-500" },
  { value: "PAID", label: "Đã thanh toán", color: "bg-green-500" },
  { value: "PAYMENT_FAILED", label: "Thanh toán lỗi", color: "bg-red-400" },
  { value: "PAYMENT_EXPIRED", label: "Hết hạn thanh toán", color: "bg-red-500" },
  { value: "PROCESSING", label: "Đang xử lý", color: "bg-blue-600" },
  { value: "READY_TO_SHIP", label: "Sẵn sàng giao", color: "bg-indigo-500" },
  { value: "SHIPPED", label: "Đã giao ĐVVC", color: "bg-purple-500" },
  { value: "IN_TRANSIT", label: "Đang vận chuyển", color: "bg-violet-500" },
  { value: "OUT_FOR_DELIVERY", label: "Đang giao hàng", color: "bg-violet-600" },
  { value: "DELIVERED", label: "Đã giao", color: "bg-teal-500" },
  { value: "COMPLETED", label: "Hoàn thành", color: "bg-emerald-600" },
  { value: "CANCEL_REQUESTED", label: "Yêu cầu hủy", color: "bg-orange-500" },
  { value: "CANCELLED_BY_CUSTOMER", label: "Khách đã hủy", color: "bg-red-500" },
  { value: "CANCELLED_BY_SELLER", label: "Seller đã hủy", color: "bg-red-500" },
  { value: "CANCEL_REJECTED", label: "Từ chối hủy", color: "bg-slate-500" },
  { value: "CANCEL_APPROVED", label: "Đã duyệt hủy", color: "bg-orange-600" },
  { value: "CANCELLED", label: "Đã hủy", color: "bg-red-500" },
  { value: "DELIVERY_FAILED", label: "Giao thất bại", color: "bg-red-600" },
  { value: "RETURN_TO_SENDER", label: "Hoàn về seller", color: "bg-orange-600" },
  { value: "RETURN_REQUESTED", label: "Yêu cầu trả hàng", color: "bg-orange-500" },
  { value: "RETURNED", label: "Đã trả hàng", color: "bg-pink-500" },
];

const adminTransitions: Record<string, string[]> = {
  PENDING: ["CANCELLED"],
  PENDING_PAYMENT: ["CANCELLED"],
  PAYMENT_FAILED: ["CANCELLED"],
  PAYMENT_EXPIRED: ["CANCELLED"],
  CANCEL_REQUESTED: ["CANCELLED"],
  DELIVERY_FAILED: ["RETURN_TO_SENDER", "CANCELLED"],
  RETURN_TO_SENDER: ["CANCELLED"],
};

const getStatusColor = (status: string) => {
  const found = statusOptions.find((opt) => opt.value === status);
  return found ? found.color : "bg-gray-500";
};

export const getOrderStatusLabel = (status?: string | null) =>
  statusOptions.find((opt) => opt.value === status)?.label || status || "N/A";

export const getAdminOrderActionLabel = (currentStatus?: string | null, nextStatus?: string | null) => {
  if (currentStatus === "CANCEL_REQUESTED" && nextStatus === "CANCELLED") return "Duyệt hủy";
  if (currentStatus === "CANCEL_REQUESTED" && ["PAID", "CONFIRMED"].includes(String(nextStatus))) return "Từ chối hủy";
  if (nextStatus === "CANCELLED") return "Hủy đơn";
  if (nextStatus === "RETURN_TO_SENDER") return "Hoàn về seller";
  return getOrderStatusLabel(nextStatus);
};

const isPaidOrder = (order: any) => {
  const payment = order.raw?.payment || order.raw?.Payment || order.payment || order.Payment;
  const status = String(payment?.status || "").toUpperCase();
  return ["SUCCESS", "PAYMENT_SUCCESS"].includes(status);
};

const getCancelRequestPreviousStatus = (order: any) => {
  const cancellation = order.raw?.cancellation || order.raw?.Cancellation || order.cancellation || order.Cancellation;
  const note = String(cancellation?.note || "");
  const previous = note
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("previousStatus="))
    ?.split("=")[1];

  return previous === "PAID" ? "PAID" : "CONFIRMED";
};

const getAdminAllowedNextStatuses = (order: any) => {
  const allowed = [...(adminTransitions[order.status] || [])];
  if (order.status === "CANCEL_REQUESTED") {
    allowed.push(getCancelRequestPreviousStatus(order));
  }
  if (!isPaidOrder(order)) return allowed;

  return allowed.filter((status) => status !== "CANCELLED");
};

export const orderColumns = (
  onView: (o: any) => void,
  onDelete: (o: any) => void,
  onUpdateStatus: (id: string, status: string) => void
) => [
  { key: "orderId", label: "Mã đơn" },
  {
    key: "checkoutGroupCode",
    label: "Nhóm checkout",
    exportValue: (o: any) => o.checkoutGroupCode || "",
    render: (o: any) => (
      o.checkoutGroupCode ? (
        <div className="min-w-36">
          <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 font-mono text-xs text-orange-700">
            {o.checkoutGroupCode}
          </span>
          {o.checkoutGroupPrimary ? <p className="mt-1 text-[11px] text-muted-foreground">Payment chính</p> : null}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    ),
  },
  { key: "shop", label: "Shop" },
  { key: "customer", label: "Khách hàng" },

  {
    key: "items",
    label: "SL",
    render: (o: any) => (
      <div className="text-center">{o.items}</div>
    ),
  },

  {
    key: "total",
    label: "Tổng tiền",
    exportValue: (o: any) => `${formatCurrency(o.total)}đ`,
    render: (o: any) => (
      <div className="text-right">
        {formatCurrency(o.total)}đ
      </div>
    ),
  },

  {
    key: "status",
    label: "Trạng thái",
    exportValue: (o: any) => getOrderStatusLabel(o.status),
    render: (o: any) => {
      const allowedNext = getAdminAllowedNextStatuses(o);
      if (!allowedNext.length) {
        return (
          <div className="flex w-[220px] items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${getStatusColor(o.status)}`} />
            {getOrderStatusLabel(o.status)}
          </div>
        );
      }

      const filteredOptions = statusOptions.filter(
        (opt) => opt.value === o.status || allowedNext.includes(opt.value)
      );

      return (
        <Select
          value={o.status}
          onValueChange={(val) => onUpdateStatus(o.id, val)}
        >
          <SelectTrigger className="w-[220px]">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(o.status)}`} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {filteredOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${option.color}`} />
                  {option.value === o.status ? option.label : getAdminOrderActionLabel(o.status, option.value)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },

  {
    key: "date",
    label: "Ngày",
    exportValue: (o: any) => formatDateTime(o.date),
    render: (o: any) => (
      <div className="text-center">{formatDateTime(o.date)}</div>
    ),
  },

  {
    key: "actions",
    label: "Thao tác",
    render: (o: any) => (
      <OrderActions
        order={o}
        onView={onView}
        onDelete={onDelete}
        canCancel={getAdminAllowedNextStatuses(o).includes("CANCELLED") && o.status !== "CANCEL_REQUESTED"}
      />
    ),
  },
];
