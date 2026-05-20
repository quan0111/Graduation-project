import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);

export function OrderStats({ orders = [] }: { orders?: any[] }) {
  const totalOrders = orders.length;
  const revenue = orders
    .filter((order) => ["DELIVERED", "COMPLETED", "delivered", "completed"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.totalAmount ?? order.total_amount ?? 0), 0);
  const processing = orders.filter((order) =>
    [
      "PENDING",
      "PENDING_PAYMENT",
      "PAYMENT_FAILED",
      "PAYMENT_EXPIRED",
      "CONFIRMED",
      "PAID",
      "PROCESSING",
      "READY_TO_SHIP",
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "pending",
      "pending_payment",
      "payment_failed",
      "payment_expired",
      "confirmed",
      "paid",
      "processing",
      "ready_to_ship",
      "shipped",
      "in_transit",
      "out_for_delivery",
    ].includes(order.status),
  ).length;
  const cancelled = orders.filter((order) =>
    [
      "CANCEL_REQUESTED",
      "CANCELLED_BY_CUSTOMER",
      "CANCELLED_BY_SELLER",
      "CANCELLED",
      "DELIVERY_FAILED",
      "RETURN_TO_SENDER",
      "cancel_requested",
      "cancelled_by_customer",
      "cancelled_by_seller",
      "cancelled",
      "delivery_failed",
      "return_to_sender",
    ].includes(order.status),
  ).length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">

      <Card>
        <CardHeader>
          <Label className="text-muted-foreground">Tổng đơn hàng</Label>
        </CardHeader>
        <CardContent className="pt-6">{totalOrders.toLocaleString("vi-VN")}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Label className="font-bold">Doanh thu</Label>
        </CardHeader>
        <CardContent className="pt-6 text-success">{formatCompactCurrency(revenue)}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Label className="font-bold">Đơn hàng đang xử lý</Label>
        </CardHeader>
        <CardContent className="pt-6 text-primary">{processing.toLocaleString("vi-VN")}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Label className="font-bold">Đơn hàng bị hủy</Label>
        </CardHeader>
        <CardContent className="pt-6 text-warning">{cancelled.toLocaleString("vi-VN")}</CardContent>
      </Card>
    </div>
  );
}
