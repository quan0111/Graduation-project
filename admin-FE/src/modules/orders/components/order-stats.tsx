import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);

export function OrderStats({ orders = [] }: { orders?: any[] }) {
  const totalOrders = orders.length;
  const revenue = orders
    .filter((order) => ["DELIVERED", "COMPLETED", "delivered", "completed"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.totalAmount ?? order.total_amount ?? 0), 0);
  const processing = orders.filter((order) => ["PENDING", "CONFIRMED", "PAID", "PROCESSING", "pending", "confirmed", "paid", "processing"].includes(order.status)).length;
  const cancelled = orders.filter((order) => ["CANCELLED", "cancelled"].includes(order.status)).length;

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
