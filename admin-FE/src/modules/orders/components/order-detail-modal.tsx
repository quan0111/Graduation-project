import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export function OrderDetailModal({
  open,
  onClose,
  order,
}: any) {
  if (!order) return null;

  const items = order.items || [];
  const payment = order.payment;
  const cancellation = order.cancellation;
  const customer = order.user?.fullName || order.user?.email || order.customer || "N/A";
  const shopNames = Array.from(
    new Set(items.map((item: any) => item.shop?.name).filter(Boolean)),
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiet don hang #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 text-sm md:grid-cols-2">
          <Info label="Khach hang" value={customer} />
          <Info label="Shop" value={shopNames.join(", ") || order.shop || "N/A"} />
          <Info label="Trang thai" value={order.status} />
          <Info label="Ngay tao" value={order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : order.date} />
          <Info label="Tam tinh" value={formatCurrency(order.subtotal)} />
          <Info label="Phi ship" value={formatCurrency(order.shippingFee)} />
          <Info label="Giam gia" value={formatCurrency(order.discountAmount)} />
          <Info label="Tong tien" value={formatCurrency(order.totalAmount || order.total)} />
          <Info label="PT van chuyen" value={order.shippingMethod || "N/A"} />
          <Info label="Thanh toan" value={payment ? `${payment.method} - ${payment.status}` : "Chua co"} />
          <Info label="Huy don" value={cancellation ? `${cancellation.cancelledBy} - ${cancellation.reason}` : "Khong"} />
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">San pham</th>
                <th className="px-3 py-2 text-left">Phan loai</th>
                <th className="px-3 py-2 text-right">SL</th>
                <th className="px-3 py-2 text-right">Don gia</th>
                <th className="px-3 py-2 text-right">Thanh tien</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">{item.productName || item.product_name}</td>
                  <td className="px-3 py-2">{item.variantName || item.variant_name || "-"}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Khong co line item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value ?? "N/A"}</p>
    </div>
  );
}
