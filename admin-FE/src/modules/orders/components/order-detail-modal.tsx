

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OrderDetailModal({
  open,
  onClose,
  order,
}: any) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng {order.orderId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p><b>Shop:</b> {order.shop}</p>
          <p><b>Khách hàng:</b> {order.customer}</p>
          <p><b>Số lượng:</b> {order.items}</p>
          <p><b>Tổng tiền:</b> {order.total}</p>
          <p><b>Trạng thái:</b> {order.status}</p>
          <p><b>Ngày:</b> {order.date}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}