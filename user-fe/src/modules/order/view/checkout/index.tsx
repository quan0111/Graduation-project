'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Archive, CheckCircle2, ExternalLink, RefreshCw, ShieldCheck, Smartphone, Timer, Truck, Zap } from "lucide-react";
import { toast } from "sonner";

import { API_URL_ORDER } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useGetAddresses } from "@/modules/address/api/get-address";
import { useAuthStore } from "@/stores/auth.store";

import { useCheckoutOrder } from "../../api/checkout";
import { Confirmation } from "../../components/checkout/confirmation";
import { OrderSummary } from "../../components/checkout/orderSumary";
import { PaymentMethod } from "../../components/checkout/paymentMethod";
import { ShippingForm } from "../../components/checkout/shippingForm";
import { ShippingMethod } from "../../components/checkout/shippingMethod";
import { Stepper } from "../../components/checkout/stepper";
import { useCheckout, type ShippingMethodType } from "../../hook/useCheckout";
import { CouponInput } from "@/modules/coupon/components/couponInput";
import type { AppliedCouponPreview, CouponStackItem } from "@/modules/coupon/api/get-coupon";

type CheckoutLocationItem = {
  id?: number | string;
  name?: string;
  image?: string;
  variantName?: string | null;
  productId?: number | string;
  variantId?: number | string | null;
  shopId?: number | string;
  quantity?: number | string;
  price?: number | string;
};

type CheckoutOrderItem = {
  cartItemId?: number;
  name: string;
  image: string;
  variantName?: string | null;
  productId: number;
  variantId: number | null;
  shopId: number;
  quantity: number;
  price: number;
};

const CHECKOUT_STORAGE_KEY = "markethub.checkout.items";
const PAYMENT_COUNTDOWN_SECONDS = 15 * 60;
const PAYMENT_POLL_INTERVAL_MS = 5000;
const PAYMENT_SUCCESS_STATUSES = new Set(["SUCCESS", "PAYMENT_SUCCESS"]);
const PAYMENT_FAILED_STATUSES = new Set(["FAILED", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]);

const readStoredCheckoutItems = (): CheckoutLocationItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export default function CheckOutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentCompletedRef = useRef(false);
  const pollingInFlightRef = useRef(false);

  const { data: addresses } = useGetAddresses();
  const checkoutMutation = useCheckoutOrder();
  const authUser = useAuthStore((store) => store.user);

  const locationItems = location.state?.items as CheckoutLocationItem[] | undefined;
  const [cartItems, setCartItems] = useState<CheckoutLocationItem[]>(() =>
    locationItems?.length ? locationItems : readStoredCheckoutItems(),
  );

  useEffect(() => {
    if (!locationItems?.length) {
      return;
    }
    setCartItems(locationItems);
    window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(locationItems));
  }, [locationItems]);

  useEffect(() => {
    if (!authUser) {
      toast.error("Bạn cần đăng nhập để thanh toán");
      navigate("/login", { state: { redirect: "/checkout" } });
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm từ giỏ hàng để thanh toán");
      navigate("/cart");
      return;
    }
  }, [navigate, cartItems, authUser]);
  const shippingMethods = [
    {
      id: "STANDARD",
      name: "Giao hàng tiêu chuẩn",
      time: "2-3 ngày",
      fee: 30000,
      icon: <Truck size={18} />,
    },
    {
      id: "EXPRESS",
      name: "Giao nhanh ưu tiên",
      time: "2-4 giờ",
      fee: 50000,
      icon: <Zap size={18} />,
    },
    {
      id: "SAME_DAY",
      name: "Giao trong ngày",
      time: "Hôm nay",
      fee: 99000,
      icon: <Archive size={18} />,
    },
  ];

  const checkoutItems: CheckoutOrderItem[] = cartItems.map((item) => ({
    cartItemId: item.id ? Number(item.id) : undefined,
    name: item.name || "Sản phẩm",
    image: item.image || "",
    variantName: item.variantName ?? null,
    productId: Number(item.productId || 0),
    variantId: item.variantId ? Number(item.variantId) : null,
    shopId: Number(item.shopId || 0),
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
  }));

  const state = useCheckout(checkoutItems);
  const checkoutShopIds = useMemo(
    () => Array.from(new Set(checkoutItems.map((item) => item.shopId).filter((shopId) => shopId > 0))),
    [checkoutItems],
  );
  const [paymentQrData, setPaymentQrData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [paymentCheckMessage, setPaymentCheckMessage] = useState("Đang chờ thanh toán.");
  const [paymentCountdown, setPaymentCountdown] = useState(PAYMENT_COUNTDOWN_SECONDS);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCouponPreview[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleShippingChange = (id: string) => {
    state.setShipping(id as ShippingMethodType);
  };

  const couponItems: CouponStackItem[] = useMemo(
    () =>
      checkoutItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        shopId: item.shopId,
        quantity: item.quantity,
        price: item.price,
        lineTotal: item.price * item.quantity,
      })),
    [checkoutItems],
  );

  const handleApplyCoupon = (coupons: AppliedCouponPreview[], discount: number) => {
    setAppliedCoupons(coupons);
    setDiscountAmount(discount);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupons([]);
    setDiscountAmount(0);
  };

  const totalWithDiscount = Math.max(
    0,
    state.subtotal + state.shippingPrice - discountAmount,
  );

  const formattedCountdown = useMemo(() => {
    const minutes = Math.floor(paymentCountdown / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (paymentCountdown % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [paymentCountdown]);

  const checkPaymentStatus = useCallback(
    async () => {
      const orderId = paymentQrData?.orderId;
      if (!orderId || paymentCompletedRef.current || pollingInFlightRef.current) {
        return;
      }

      pollingInFlightRef.current = true;
      setIsCheckingPayment(true);
      try {
        const response = await apiClient.get(`${API_URL_ORDER}/payment/order/${orderId}`);
        const payment = response.data?.data ?? response.data;
        const status = String(payment?.status ?? "").toUpperCase();

        if (PAYMENT_SUCCESS_STATUSES.has(status)) {
          paymentCompletedRef.current = true;
          setPaymentStatus("success");
          setPaymentCheckMessage("Thanh toán đã được xác nhận. Hóa đơn đã được tạo, đang chuyển tới chi tiết đơn hàng...");
          window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
          toast.success("Thanh toán thành công");
          window.setTimeout(() => navigate(`/orders/${orderId}`), 900);
          return;
        }

        if (PAYMENT_FAILED_STATUSES.has(status)) {
          setPaymentStatus("failed");
          setPaymentCheckMessage("Thanh toán chưa thành công hoặc đã hết hạn. Bạn có thể tạo lại thanh toán từ đơn hàng.");
          return;
        }

        setPaymentStatus("pending");
        setPaymentCheckMessage("Đang chờ MoMo gửi xác nhận thanh toán về hệ thống.");
      } catch {
        setPaymentCheckMessage("Chưa kiểm tra được trạng thái thanh toán. Hệ thống sẽ thử lại tự động.");
      } finally {
        setIsCheckingPayment(false);
        pollingInFlightRef.current = false;
      }
    },
    [navigate, paymentQrData?.orderId],
  );

  const expirePaymentHold = useCallback(async () => {
    const orderId = paymentQrData?.orderId;
    if (!orderId || paymentCompletedRef.current) {
      return;
    }
    try {
      await apiClient.post(`${API_URL_ORDER}/payment/order/${orderId}/expire`);
    } catch {
      // The next checkout attempt will revalidate stock and coupons on the backend.
    }
  }, [paymentQrData?.orderId]);

  useEffect(() => {
    if (state.step !== 5 || !paymentQrData?.orderId || paymentStatus === "success" || paymentStatus === "failed") {
      return;
    }

    const initialTimer = window.setTimeout(() => {
      checkPaymentStatus();
    }, 1500);
    const interval = window.setInterval(() => {
      checkPaymentStatus();
    }, PAYMENT_POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [checkPaymentStatus, paymentQrData?.orderId, paymentStatus, state.step]);

  useEffect(() => {
    if (state.step !== 5 || !paymentQrData || paymentStatus === "success" || paymentStatus === "failed") {
      return;
    }

    const interval = window.setInterval(() => {
      setPaymentCountdown((current) => {
        if (current <= 1) {
          setPaymentStatus("failed");
          setPaymentCheckMessage("Mã QR đã quá thời gian chờ. Hóa đơn chưa được tạo, bạn có thể thanh toán lại từ checkout.");
          void expirePaymentHold();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expirePaymentHold, paymentQrData, paymentStatus, state.step]);

  const handlePlaceOrder = async () => {
    if (!state.shippingAddress) {
      toast.error("Chọn địa chỉ giao hàng trước");
      return;
    }

    try {
      if (!authUser) {
        toast.error("Bạn cần đăng nhập để đặt hàng");
        return;
      }

      const validItems = checkoutItems.filter((item) => item.productId > 0 && item.shopId > 0);
      if (!validItems.length) {
        toast.error("Dữ liệu sản phẩm không hợp lệ");
        return;
      }

      const payload = {
        userId: authUser.id,
        subtotal: state.subtotal,
        shippingFee: state.shippingPrice,
        shippingMethod: state.shipping,
        discountAmount,
        totalAmount: totalWithDiscount,
        shippingAddressId: state.shippingAddress.id,
        couponId: appliedCoupons[0]?.id ? Number(appliedCoupons[0].id) : undefined,
        couponIds: appliedCoupons.map((coupon) => Number(coupon.id)),
        cartItemIds: checkoutItems
          .map((item) => item.cartItemId)
          .filter((cartItemId): cartItemId is number => Boolean(cartItemId)),
        items: validItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          shopId: item.shopId,
          quantity: item.quantity,
          price: item.price,
        })),
        // Chỉ tạo payment record cho MOMO/VNPAY (thanh toán trước)
        // COD không cần payment record lúc đặt hàng
        payment: (state.payment === "MOMO" || state.payment === "VNPAY") ? {
          method: state.payment,
          status: "PENDING",
        } : undefined,
      };

      const checkoutResult = await checkoutMutation.mutateAsync(payload);
      // Chỉ tạo QR payment cho MOMO/VNPAY
      if (state.payment === "MOMO" || state.payment === "VNPAY") {
        setPaymentQrData({
          paymentUrl: checkoutResult.paymentUrl,
          qrCodeUrl: checkoutResult.qrCodeUrl,
          deeplink: checkoutResult.deeplink,
          providerOrderId: checkoutResult.providerOrderId,
          requestId: checkoutResult.requestId,
          orderId: checkoutResult.order.id,
        });
        paymentCompletedRef.current = false;
        pollingInFlightRef.current = false;
        setPaymentStatus("pending");
        setPaymentCheckMessage("Mã QR đã sẵn sàng. Hóa đơn chỉ được tạo sau khi thanh toán thành công.");
        setPaymentCountdown(PAYMENT_COUNTDOWN_SECONDS);
        state.setStep(5); // New step for QR display
        return;
      }

      window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      toast.success("Đặt hàng thành công");
      navigate(`/orders/${checkoutResult.order.id}`);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Không thể tạo đơn hàng");
    }
  };

  if (!checkoutItems.length) {
    return <div className="p-6 text-sm text-slate-500">Không có sản phẩm để thanh toán.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <section className="rounded-4xl bg-[radial-gradient(circle_at_top_left,rgba(238,77,45,0.16),transparent_36%),linear-gradient(135deg,#111827,#1f2937)] px-6 py-8 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-orange-200">Quy trình thanh toán</p>
              <h1 className="mt-3 text-3xl font-semibold">Xác nhận đơn hàng theo từng bước</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Kiểm tra địa chỉ, chọn vận chuyển, xác nhận thanh toán và tạo hóa đơn trong một màn hình rõ ràng hơn.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <ShieldCheck className="size-4 text-emerald-300" />
              Phiên thanh toán an toàn
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_380px]">
          <div className="space-y-6">
            <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <Stepper step={state.step} />
            </div>

            {state.step === 1 ? (
              <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <ShippingForm
                  addresses={addresses || []}
                  onNext={(address) => {
                    state.setShippingAddress(address);
                    state.setStep(2);
                  }}
                />
              </div>
            ) : null}

            {state.step === 2 ? (
              <div className="space-y-4 rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <ShippingMethod
                  value={state.shipping}
                  onChange={handleShippingChange}
                  methods={shippingMethods}
                />
                <button
                  type="button"
                  onClick={() => state.setStep(3)}
                  className="h-11 w-full rounded-full bg-[#ee4d2d] font-semibold text-white transition hover:bg-[#d93f21]"
                >
                  Tiếp tục đến thanh toán
                </button>
              </div>
            ) : null}

            {state.step === 3 ? (
              <div className="space-y-4 rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <PaymentMethod
                  value={state.payment}
                  onChange={state.setPayment}
                  methods={[
                    { id: "COD", name: "Thanh toán khi nhận hàng" },
                    { id: "MOMO", name: "MoMo QR" },
                    { id: "VNPAY", name: "VNPay QR" },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => state.setStep(4)}
                  className="h-11 w-full rounded-full bg-[#ee4d2d] font-semibold text-white transition hover:bg-[#d93f21]"
                >
                  Xem lại thanh toán
                </button>
              </div>
            ) : null}

            {state.step === 4 ? (
              <div className="space-y-4 rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <Confirmation
                  total={totalWithDiscount}
                  onSubmit={handlePlaceOrder}
                  loading={checkoutMutation.isPending}
                  paymentMethod={state.payment}
                />
              </div>
            ) : null}

            {state.step === 5 && paymentQrData ? (
              <div className="space-y-4 rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex flex-col gap-3 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                    <Smartphone className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {state.payment === "MOMO" ? "Thanh toán MoMo ngay trong checkout" : "Quét mã QR để thanh toán"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Mở app {state.payment === "MOMO" ? "MoMo" : "VNPay"}, quét mã bên dưới và giữ trang này để hệ thống tự xác nhận.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)] md:items-center">
                  <div className="flex justify-center rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    {paymentQrData.qrCodeUrl ? (
                    <img
                      src={paymentQrData.qrCodeUrl}
                      alt={`${state.payment} QR Code`}
                      className="h-60 w-60 rounded-2xl bg-white object-contain p-2 shadow-sm"
                    />
                    ) : (
                      <div className="flex h-60 w-60 items-center justify-center rounded-2xl bg-white px-4 text-center text-sm text-amber-700">
                        Cổng thanh toán chưa trả dữ liệu QR. Vui lòng dùng nút mở trang thanh toán bên dưới.
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-left">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Trạng thái thanh toán</p>
                          <p className="mt-1 text-sm text-slate-500">{paymentCheckMessage}</p>
                        </div>
                        {paymentStatus === "success" ? (
                          <CheckCircle2 className="size-6 text-emerald-500" />
                        ) : (
                          <RefreshCw className={`size-5 text-orange-500 ${isCheckingPayment ? "animate-spin" : ""}`} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                      <span className="flex items-center gap-2 font-medium">
                        <Timer className="size-4" />
                        Thời gian giữ mã
                      </span>
                      <span className="font-semibold tabular-nums">{formattedCountdown}</span>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                      Sau khi bạn thanh toán trên app, cổng thanh toán sẽ gửi IPN/callback về hệ thống. Trang này tự kiểm tra mỗi 5 giây và chỉ tạo hóa đơn khi trạng thái thành công.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {paymentStatus !== "failed" && paymentQrData.paymentUrl && (
                    <a
                      href={paymentQrData.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ee4d2d] py-3 text-center font-semibold text-white transition hover:bg-[#d93f21]"
                    >
                      <ExternalLink className="size-4" />
                      Mở trang thanh toán
                    </a>
                  )}

                  {paymentStatus !== "failed" && paymentQrData.deeplink && (
                    <a
                      href={paymentQrData.deeplink}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#ee4d2d] py-3 text-center font-semibold text-[#ee4d2d] transition hover:bg-[#ee4d2d] hover:text-white"
                    >
                      <Smartphone className="size-4" />
                      Mở app {state.payment === "MOMO" ? "MoMo" : "VNPay"}
                    </a>
                  )}

                  {paymentStatus === "failed" && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentQrData(null);
                        setPaymentStatus("idle");
                        setPaymentCountdown(PAYMENT_COUNTDOWN_SECONDS);
                        paymentCompletedRef.current = false;
                        pollingInFlightRef.current = false;
                        state.setStep(4);
                      }}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#ee4d2d] py-3 text-center font-semibold text-white transition hover:bg-[#d93f21]"
                    >
                      Quay lại xác nhận thanh toán
                    </button>
                  )}
                </div>

                <p className="text-center text-xs text-slate-500">
                  Bạn không cần bấm xác nhận thủ công. Hệ thống tự đồng bộ trạng thái sau khi MoMo gửi kết quả thanh toán.
                </p>
              </div>
            ) : null}
          </div>

            <div className="space-y-6">
              <CouponInput
                orderAmount={state.subtotal}
                shippingFee={state.shippingPrice}
                shopIds={checkoutShopIds}
                items={couponItems}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />

              <OrderSummary
                items={checkoutItems}
                subtotal={state.subtotal}
                total={totalWithDiscount}
                shipping={state.shippingPrice}
                tax={state.tax}
                discount={discountAmount}
              />
            </div>
        </div>
      </div>
    </div>
  );
}
