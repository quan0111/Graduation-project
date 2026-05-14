import { OrderActions } from "./order-action";
import { formatCurrency } from "../utils/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusOptions = [
  { value: "PENDING", label: "Chờ xác nhận", color: "bg-yellow-500" },
  { value: "CONFIRMED", label: "Đã xác nhận", color: "bg-blue-500" },
  { value: "PAID", label: "Đã thanh toán", color: "bg-green-500" },
  { value: "PAYMENT_FAILED", label: "Thanh toán lỗi", color: "bg-red-400" },
  { value: "PROCESSING", label: "Đang xử lý", color: "bg-blue-600" },
  { value: "READY_TO_SHIP", label: "Sẵn sàng giao", color: "bg-indigo-500" },
  { value: "SHIPPED", label: "Đã gửi hàng", color: "bg-purple-500" },
  { value: "IN_TRANSIT", label: "Đang vận chuyển", color: "bg-violet-500" },
  { value: "DELIVERED", label: "Đã giao", color: "bg-teal-500" },
  { value: "COMPLETED", label: "Hoàn thành", color: "bg-emerald-600" },
  { value: "CANCELLED", label: "Đã hủy", color: "bg-red-500" },
  { value: "RETURN_REQUESTED", label: "Yêu cầu trả hàng", color: "bg-orange-500" },
  { value: "RETURNED", label: "Đã trả hàng", color: "bg-pink-500" },
];

const getStatusColor = (status: string) => {
  const found = statusOptions.find(opt => opt.value === status);
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
      // Define valid transitions for ADMIN role (matching backend)
      const adminTransitions: Record<string, string[]> = {
        PENDING: ["PAID", "PAYMENT_FAILED", "CONFIRMED", "CANCELLED"],
        PAYMENT_FAILED: ["PENDING", "CANCELLED"],
        PAID: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["READY_TO_SHIP", "CANCELLED"],
        READY_TO_SHIP: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["IN_TRANSIT"],
        IN_TRANSIT: ["DELIVERED"],
        DELIVERED: ["COMPLETED", "RETURN_REQUESTED"],
        COMPLETED: ["RETURN_REQUESTED"],
      };

      const allowedNext = adminTransitions[o.status] || [];
      const filteredOptions = statusOptions.filter(
        (opt) => opt.value === o.status || allowedNext.includes(opt.value)
      );

      return (
        <Select
          value={o.status}
          onValueChange={(val) => onUpdateStatus(o.id, val)}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(o.status)}`} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {filteredOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${option.color}`} />
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
