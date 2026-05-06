import { OrderActions } from "./order-action";
import { formatCurrency } from "../utils/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    render: (o: any) => (
      <Select
        value={o.status}
        onValueChange={(val) => onUpdateStatus(o.id, val)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Đã giao">Đã giao</SelectItem>
          <SelectItem value="Đang giao">Đang giao</SelectItem>
          <SelectItem value="Chưa thanh toán">Chưa thanh toán</SelectItem>
          <SelectItem value="Đã hủy">Đã hủy</SelectItem>
        </SelectContent>
      </Select>
    ),
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