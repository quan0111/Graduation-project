import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, RotateCcw, Star } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/app-dialog";
import { ReturnRequestForm } from "@/modules/return-request/components/returnRequestForm";
import { ReviewForm } from "@/modules/review/components/reviewForm";
import { ChatWithShopButton } from "@/modules/support/components/chat-with-shop-button";

import { useGetOrderById } from "../../api/get-order";
import { useConfirmPackageReceived } from "../../api/update-order";
import { CancelOrderModal } from "../../components/CancelOrderModal";
import { OrderActions } from "../../components/orderAction";
import { OrderHeader } from "../../components/orderHeader";
import { OrderItems } from "../../components/orderItems";
import { PaymentRetryPanel } from "../../components/paymentRetryPanel";
import { OrderShipping } from "../../components/shipping";
import { OrderSummary } from "../../components/summary";
import { OrderTimeline } from "../../components/orderTimeLine";
import type { IOrderItem, IOrderShopPackage } from "../../types";
import { formatDateTime, getStatusMeta } from "../../utils/order";

export default function OrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useGetOrderById(orderId, {
    enabled: !!orderId,
  });
  const completePackageMutation = useConfirmPackageReceived();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [confirmPackage, setConfirmPackage] = useState<IOrderShopPackage | null>(null);
  const [reviewItem, setReviewItem] = useState<IOrderItem | null>(null);

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Đang tải hóa đơn...</div>;
  }

  if (isError || !order) {
    return <div className="p-6 text-sm text-rose-500">Không tìm thấy hóa đơn.</div>;
  }

  const normalizedStatus = String(order.status).toLowerCase();
  const canReviewProducts = normalizedStatus === "completed";
  const orderShops = Array.from(
    new Map(
      order.items.map((item) => [
        item.shop_id,
        {
          id: item.shop_id,
          name: item.shop?.name || `Shop #${item.shop_id}`,
        },
      ]),
    ).values(),
  );
  const shopPackages: IOrderShopPackage[] = order.packages?.length
    ? order.packages
    : orderShops.map((shop) => ({
        id: 0,
        order_id: order.id,
        shop_id: shop.id,
        status: order.status,
        carrier: null,
        tracking_number: null,
        shipped_at: null,
        delivered_at: null,
        created_at: order.created_at,
        updated_at: order.updated_at,
        shop,
      }));

  const handleCompletePackage = async () => {
    if (!confirmPackage || !confirmPackage.id) {
      return;
    }

    try {
      await completePackageMutation.mutateAsync({
        orderId: order.id,
        packageId: confirmPackage.id,
      });
      await queryClient.invalidateQueries({ queryKey: ["orders", "detail", order.id] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["shipment", "order", order.id] });
      setConfirmPackage(null);
      toast.success(`Đã xác nhận nhận hàng từ ${confirmPackage.shop?.name || `Shop #${confirmPackage.shop_id}`}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xác nhận đã nhận hàng");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-5">
          <Link to="/orders" className={`${buttonVariants({ variant: "outline" })} inline-flex`}>
            <ChevronLeft className="size-4" />
            Quay lại đơn hàng
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-4xl bg-white shadow-sm ring-1 ring-slate-200/80">
              <OrderHeader order={order} expanded />
            </div>

            <OrderTimeline status={order.status} order={order} />
            <OrderShipping order={order} />
            <section className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="mb-5">
                <p className="text-lg font-semibold text-slate-950">Theo dõi theo từng shop</p>
                <p className="mt-1 text-sm text-slate-500">
                  Mỗi shop trong cùng một hóa đơn có trạng thái giao hàng và mã vận đơn riêng.
                </p>
              </div>

              <div className="space-y-4">
                {shopPackages.map((shopPackage) => {
                  const packageItems = order.items.filter((item) => item.shop_id === shopPackage.shop_id);
                  const statusMeta = getStatusMeta(shopPackage.status);
                  const shopName = shopPackage.shop?.name || packageItems[0]?.shop?.name || `Shop #${shopPackage.shop_id}`;
                  const canConfirmPackage = shopPackage.id > 0 && shopPackage.status === "delivered";

                  return (
                    <div key={`${shopPackage.shop_id}-${shopPackage.id}`} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">{shopName}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            {shopPackage.carrier ? <span>ĐVVC: {shopPackage.carrier}</span> : null}
                            {shopPackage.tracking_number ? <span>Mã vận đơn: {shopPackage.tracking_number}</span> : null}
                            {shopPackage.shipped_at ? <span>Gửi: {formatDateTime(shopPackage.shipped_at)}</span> : null}
                            {shopPackage.delivered_at ? <span>Giao: {formatDateTime(shopPackage.delivered_at)}</span> : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusMeta.chip}`}>
                            {statusMeta.label}
                          </span>
                          {canConfirmPackage ? (
                            <Button
                              size="sm"
                              className="bg-[#ee4d2d] hover:bg-[#d93f21]"
                              disabled={completePackageMutation.isPending}
                              onClick={() => setConfirmPackage(shopPackage)}
                            >
                              Đã nhận gói này
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {packageItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                            <img
                              src={item.product_image || "/placeholder.png"}
                              alt={item.product_name}
                              className="size-12 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{item.product_name}</p>
                              <p className="text-xs text-slate-500">{item.variant_name || "Mặc định"} x {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="mb-5">
                <p className="text-lg font-semibold text-slate-950">Sản phẩm trong đơn</p>
                <p className="text-sm text-slate-500">
                  Thông tin hiển thị đúng theo hóa đơn của tài khoản hiện tại.
                </p>
              </div>
              <OrderItems items={order.items} />
              {canReviewProducts ? (
                <div className="mt-5 rounded-3xl border border-orange-100 bg-orange-50/60 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-900">Đánh giá sản phẩm</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Đơn đã hoàn tất, bạn có thể đánh giá từng sản phẩm đã mua.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-orange-100 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{item.product_name}</p>
                          <p className="text-xs text-slate-500">{item.variant_name || "Mặc định"}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-orange-200 text-[#ee4d2d] hover:bg-orange-50"
                          onClick={() => setReviewItem(item)}
                        >
                          <Star className="size-4" />
                          Đánh giá
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-6">
            <OrderSummary order={order} />
            <PaymentRetryPanel orderId={order.id} payment={order.payment} />

            <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <p className="mb-4 text-base font-semibold text-slate-950">Tác vụ</p>
              <OrderActions order={order} />
              {orderShops.length > 0 ? (
                <div className="mt-4 space-y-2 rounded-3xl border border-orange-100 bg-orange-50/60 p-3">
                  <p className="text-sm font-medium text-slate-800">Liên hệ shop trong đơn</p>
                  {orderShops.map((shop) => (
                    <ChatWithShopButton
                      key={shop.id}
                      shopId={shop.id}
                      shopName={shop.name}
                      orderId={order.id}
                      subject={`Hỏi về đơn hàng #${order.id}`}
                      className="w-full justify-start border-orange-200 bg-white text-[#ee4d2d] hover:bg-orange-50"
                    >
                      <span className="min-w-0 truncate">{shop.name}</span>
                    </ChatWithShopButton>
                  ))}
                </div>
              ) : null}
              {["pending", "pending_payment", "paid", "confirmed", "payment_failed", "payment_expired"].includes(normalizedStatus) ? (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <RotateCcw className="size-4" />
                  Hủy đơn hàng
                </button>
              ) : null}
              {["delivered", "completed"].includes(normalizedStatus) ? (
                <button
                  type="button"
                  onClick={() => setShowReturnForm(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="size-4" />
                  Yêu cầu trả hàng
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {showReturnForm ? (
        <ReturnRequestForm
          orderId={orderId}
          orderItems={order.items}
          onCancel={() => setShowReturnForm(false)}
          onSuccess={() => {
            setShowReturnForm(false);
            queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
          }}
        />
      ) : null}

      {showCancelModal ? (
        <CancelOrderModal
          orderId={orderId}
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            setShowCancelModal(false);
            queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
          }}
        />
      ) : null}

      {reviewItem ? (
        <ReviewForm
          productId={reviewItem.product_id}
          userId={order.user_id}
          productName={reviewItem.product_name}
          productImage={reviewItem.product_image}
          variantName={reviewItem.variant_name}
          onCancel={() => setReviewItem(null)}
          onSuccess={() => {
            const productId = reviewItem.product_id;
            setReviewItem(null);
            queryClient.invalidateQueries({ queryKey: ["reviews", "product", productId] });
            queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] });
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmPackage)}
        title="Xác nhận đã nhận được hàng"
        description={`Xác nhận bạn đã nhận gói hàng từ ${confirmPackage?.shop?.name || `Shop #${confirmPackage?.shop_id ?? ""}`}. Các shop khác trong hóa đơn vẫn giữ trạng thái riêng.`}
        confirmLabel="Đã nhận gói này"
        isPending={completePackageMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setConfirmPackage(null);
        }}
        onConfirm={handleCompletePackage}
      />
    </div>
  );
}
