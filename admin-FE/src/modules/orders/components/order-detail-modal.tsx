import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/date";
import { getOrderStatusLabel } from "./order-collums";

const formatCurrency = (value?: number | string | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const pick = (...values: any[]) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getItems = (order: any) => order.items || order.Items || [];

const getAddressText = (address: any) => {
  if (!address) return "N/A";

  return [
    pick(address.fullName, address.receiverName, address.name),
    address.phone,
    pick(address.addressLine, address.address_line, address.address),
    address.ward,
    address.district,
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .join(" - ");
};

const getItemProductName = (item: any) =>
  pick(
    item.productName,
    item.product_name,
    item.product?.name,
    item.Product?.name,
    item.name,
    item.productId ? `Sản phẩm #${item.productId}` : null,
  ) || "N/A";

const getItemVariantName = (item: any) =>
  pick(item.variantName, item.variant_name, item.variant?.name, item.ProductVariant?.name) || "-";

const getItemImage = (item: any) =>
  pick(
    item.productImage,
    item.product_image,
    item.image,
    item.product?.images?.[0]?.url,
    item.Product?.images?.[0]?.url,
  );

const addTimelineEvent = (events: any[], at: any, title: string, detail?: string) => {
  if (!at) return;
  events.push({ at, title, detail });
};

const getOrderTimeline = (order: any) => {
  const events: Array<{ at: any; title: string; detail?: string }> = [];
  const payment = order.payment || order.Payment;
  const packages = order.packages || order.Packages || [];
  const shipmentEvents = order.shipmentEvents || order.ShipmentEvents || [];
  const cancellation = order.cancellation || order.Cancellation;
  const returnRequests = order.returnRequests || order.ReturnRequests || [];
  const paymentEvents = [
    ...(payment?.events || payment?.Events || []),
    ...(order.paymentEvents || order.PaymentEvents || []),
  ];

  addTimelineEvent(events, pick(order.createdAt, order.created_at), "Tạo đơn", getOrderStatusLabel(order.status));
  paymentEvents.forEach((event: any) =>
    addTimelineEvent(
      events,
      pick(event.createdAt, event.created_at),
      `Thanh toán: ${pick(event.eventType, event.event_type) || "event"}`,
      [pick(event.status, event.paymentStatus), event.message, event.transactionId].filter(Boolean).join(" - "),
    ),
  );
  packages.forEach((pkg: any) => {
    addTimelineEvent(events, pick(pkg.createdAt, pkg.created_at), `Gói shop ${pick(pkg.shop?.name, pkg.Shop?.name, pkg.shopId) || ""}`, getOrderStatusLabel(pkg.status));
    addTimelineEvent(events, pick(pkg.shippedAt, pkg.shipped_at), "Seller bàn giao vận chuyển", pkg.trackingNumber);
    addTimelineEvent(events, pick(pkg.deliveredAt, pkg.delivered_at), "Giao hàng thành công", pick(pkg.shop?.name, pkg.Shop?.name));
  });
  shipmentEvents.forEach((event: any) =>
    addTimelineEvent(
      events,
      pick(event.createdAt, event.created_at),
      `Vận chuyển: ${pick(event.status, event.eventType, event.event_type) || "event"}`,
      pick(event.description, event.message, event.location),
    ),
  );
  if (cancellation) {
    addTimelineEvent(
      events,
      pick(cancellation.cancelledAt, cancellation.createdAt, cancellation.created_at),
      `Hủy đơn: ${pick(cancellation.status, cancellation.cancelledBy, cancellation.cancelled_by) || ""}`,
      pick(cancellation.reason, cancellation.note),
    );
  }
  returnRequests.forEach((request: any) =>
    addTimelineEvent(
      events,
      pick(request.createdAt, request.created_at),
      `Trả hàng/hoàn tiền: ${pick(request.status, request.gatewayRefundStatus) || ""}`,
      pick(request.reason, request.rejectReason, request.description),
    ),
  );

  return events.sort((left, right) => new Date(left.at).getTime() - new Date(right.at).getTime());
};

export function OrderDetailModal({
  open,
  onClose,
  order,
}: any) {
  if (!order) return null;

  const items = getItems(order);
  const timeline = getOrderTimeline(order);
  const payment = order.payment || order.Payment;
  const cancellation = order.cancellation || order.Cancellation;
  const shippingAddress = order.shippingAddress || order.ShippingAddress || order.shipping_address;
  const packages = order.packages || order.Packages || [];
  const customer = pick(
    order.user?.fullName,
    order.User?.fullName,
    order.user?.email,
    order.User?.email,
    order.customer,
  ) || "N/A";

  const shopNames = Array.from(
    new Set([
      ...items.map((item: any) => pick(item.shop?.name, item.Shop?.name)).filter(Boolean),
      ...packages.map((item: any) => pick(item.shop?.name, item.Shop?.name)).filter(Boolean),
      pick(order.shop?.name, order.Shop?.name, order.shop),
    ].filter(Boolean)),
  );

  const subtotal = pick(order.subtotal, order.sub_total);
  const shippingFee = pick(order.shippingFee, order.shipping_fee);
  const discountAmount = pick(order.discountAmount, order.discount_amount);
  const totalAmount = pick(order.totalAmount, order.total_amount, order.total);
  const paymentText = payment
    ? [
        `${pick(payment.method, payment.paymentMethod) || "N/A"} - ${pick(payment.status, payment.paymentStatus) || "N/A"}`,
        payment.amount !== undefined && payment.amount !== null ? `Số tiền: ${formatCurrency(payment.amount)}` : null,
        payment.providerOrderId ? `Provider: ${payment.providerOrderId}` : null,
        payment.transactionId ? `GD: ${payment.transactionId}` : null,
        payment.paidAt ? `Thanh toán: ${formatDateTime(payment.paidAt)}` : null,
      ]
        .filter(Boolean)
        .join(" | ")
    : "Chưa có";
  const cancellationText = cancellation
    ? [
        pick(cancellation.cancelledBy, cancellation.cancelled_by),
        pick(cancellation.reason, cancellation.note),
        pick(cancellation.createdAt, cancellation.created_at)
          ? formatDateTime(pick(cancellation.createdAt, cancellation.created_at))
          : null,
      ]
        .filter(Boolean)
        .join(" - ")
    : "Không";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
        </DialogHeader>

        <section className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
          <Info label="Khách hàng" value={customer} />
          <Info label="Shop" value={shopNames.join(", ") || "N/A"} />
          <Info label="Trạng thái" value={getOrderStatusLabel(order.status)} />
          <Info label="Ngày tạo" value={formatDateTime(pick(order.createdAt, order.created_at))} />
          <Info label="Cập nhật" value={formatDateTime(pick(order.updatedAt, order.updated_at), "N/A")} />
          <Info label="PT vận chuyển" value={pick(order.shippingMethod, order.shipping_method) || "N/A"} />
          <Info label="Tạm tính" value={formatCurrency(subtotal)} />
          <Info label="Phí ship" value={formatCurrency(shippingFee)} />
          <Info label="Giảm giá" value={formatCurrency(discountAmount)} />
          <Info label="Tổng tiền" value={formatCurrency(totalAmount)} />
          <Info className="md:col-span-2" label="Thanh toán" value={paymentText} />
          <Info className="md:col-span-2 xl:col-span-3" label="Địa chỉ giao hàng" value={getAddressText(shippingAddress)} />
          <Info className="md:col-span-2 xl:col-span-3" label="Hủy đơn" value={cancellationText} />
        </section>

        {timeline.length ? (
          <section className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Timeline đơn hàng</h3>
            <ol className="space-y-3 rounded-lg border p-4 text-sm">
              {timeline.map((event, index) => (
                <li key={`${event.title}-${event.at}-${index}`} className="grid gap-1 border-l-2 border-primary/30 pl-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{event.title}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(event.at)}</span>
                  </div>
                  {event.detail ? <p className="whitespace-normal break-words text-muted-foreground">{event.detail}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Sản phẩm trong đơn</h3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Sản phẩm</th>
                  <th className="px-3 py-2 text-left">Shop</th>
                  <th className="px-3 py-2 text-left">Phân loại</th>
                  <th className="px-3 py-2 text-right">SL</th>
                  <th className="px-3 py-2 text-right">Đơn giá</th>
                  <th className="px-3 py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, index: number) => {
                  const quantity = Number(item.quantity || 0);
                  const price = Number(pick(item.price, item.unitPrice, item.unit_price) || 0);
                  const lineTotal = Number(pick(item.totalAmount, item.total_amount, item.lineTotal, item.line_total) || price * quantity);
                  const image = getItemImage(item);

                  return (
                    <tr key={item.id ?? `${item.productId}-${item.variantId}-${index}`} className="border-t">
                      <td className="px-3 py-2 align-top">
                        <div className="flex min-w-0 items-start gap-3">
                          {image ? (
                            <img src={image} alt={getItemProductName(item)} className="size-12 shrink-0 rounded-md object-cover" />
                          ) : null}
                          <div className="min-w-0">
                            <p className="whitespace-normal break-words font-medium">{getItemProductName(item)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              #{pick(item.productId, item.product_id) || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">{pick(item.shop?.name, item.Shop?.name) || "N/A"}</td>
                      <td className="px-3 py-2 align-top">{getItemVariantName(item)}</td>
                      <td className="px-3 py-2 text-right align-top">{quantity}</td>
                      <td className="px-3 py-2 text-right align-top">{formatCurrency(price)}</td>
                      <td className="px-3 py-2 text-right align-top">{formatCurrency(lineTotal)}</td>
                    </tr>
                  );
                })}
                {!items.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                      Không có line item.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {packages.length ? (
          <section className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Gói giao theo shop</h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Shop</th>
                    <th className="px-3 py-2 text-left">Trạng thái</th>
                    <th className="px-3 py-2 text-left">Đơn vị</th>
                    <th className="px-3 py-2 text-left">Mã vận đơn</th>
                    <th className="px-3 py-2 text-left">Gửi hàng</th>
                    <th className="px-3 py-2 text-left">Giao hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg: any) => (
                    <tr key={pkg.id ?? `${pkg.orderId}-${pkg.shopId}`} className="border-t">
                      <td className="px-3 py-2">{pick(pkg.shop?.name, pkg.Shop?.name, pkg.shopId ? `Shop #${pkg.shopId}` : null) || "N/A"}</td>
                      <td className="px-3 py-2">{getOrderStatusLabel(pkg.status)}</td>
                      <td className="px-3 py-2">{pkg.carrier || "-"}</td>
                      <td className="px-3 py-2">{pkg.trackingNumber || "-"}</td>
                      <td className="px-3 py-2">{formatDateTime(pkg.shippedAt, "-")}</td>
                      <td className="px-3 py-2">{formatDateTime(pkg.deliveredAt, "-")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value, className = "" }: { label: string; value: any; className?: string }) {
  return (
    <div className={`rounded-lg border bg-card p-3 ${className}`}>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-normal break-words font-medium text-foreground">{value ?? "N/A"}</p>
    </div>
  );
}
