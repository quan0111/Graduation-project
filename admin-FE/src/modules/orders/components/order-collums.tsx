import { OrderActions } from "./order-action";
import { formatCurrency } from "../utils/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusOptions = [
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
  PENDING: ["PENDING_PAYMENT", "PAID", "PAYMENT_FAILED", "CONFIRMED", "CANCELLED_BY_CUSTOMER", "CANCELLED"],
  PENDING_PAYMENT: ["PAID", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "CANCELLED_BY_CUSTOMER", "CANCELLED"],
  PAYMENT_FAILED: ["PENDING_PAYMENT", "PAYMENT_EXPIRED", "CANCELLED_BY_CUSTOMER", "CANCELLED"],
  PAYMENT_EXPIRED: ["PENDING_PAYMENT", "CANCELLED_BY_CUSTOMER", "CANCELLED"],
  PAID: ["CONFIRMED"],
  CONFIRMED: ["PROCESSING", "CANCEL_REQUESTED", "CANCELLED_BY_SELLER", "CANCELLED"],
  PROCESSING: ["READY_TO_SHIP", "CANCEL_REQUESTED", "CANCELLED_BY_SELLER", "CANCELLED"],
  READY_TO_SHIP: ["SHIPPED", "CANCEL_REQUESTED", "CANCELLED_BY_SELLER", "CANCELLED"],
  SHIPPED: ["IN_TRANSIT", "DELIVERY_FAILED", "RETURN_TO_SENDER"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "DELIVERY_FAILED", "RETURN_TO_SENDER"],
  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED", "RETURN_TO_SENDER"],
  DELIVERED: ["COMPLETED", "RETURN_REQUESTED"],
  COMPLETED: ["RETURN_REQUESTED"],
  CANCEL_REQUESTED: ["CANCEL_APPROVED", "CANCEL_REJECTED", "CANCELLED"],
  CANCEL_REJECTED: ["CONFIRMED", "PROCESSING"],
  CANCEL_APPROVED: ["CANCELLED"],
  CANCELLED_BY_CUSTOMER: ["CANCELLED"],
  CANCELLED_BY_SELLER: ["CANCELLED"],
  DELIVERY_FAILED: ["RETURN_TO_SENDER", "CANCELLED"],
  RETURN_TO_SENDER: ["CANCELLED"],
};

const getStatusColor = (status: string) => {
  const found = statusOptions.find((opt) => opt.value === status);
  return found ? found.color : "bg-gray-500";
};

export const orderColumns = (
  onView: (o: any) => void,
  onDelete: (o: any) => void,
  onUpdateStatus: (id: string, status: string) => void
) => [
  { key: "orderId", label: "Mã đơn" },
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
    render: (o: any) => (
      <div className="text-right">
        {formatCurrency(o.total)}đ
      </div>
    ),
  },

  {
    key: "status",
    label: "Trạng thái",
    render: (o: any) => {
      const allowedNext = adminTransitions[o.status] || [];
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
                  {option.label}
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
    render: (o: any) => (
      <div className="text-center">{o.date}</div>
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
      />
    ),
  },
];
