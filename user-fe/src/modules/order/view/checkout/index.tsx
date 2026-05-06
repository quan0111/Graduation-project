'use client';

import { useLocation, useNavigate } from "react-router-dom";
import { Archive, ShieldCheck, Truck, Zap } from "lucide-react";
import { toast } from "sonner";

import { getStoredStorefrontUser } from "@/lib/auth-storage";
import { useDeleteCartItem } from "@/modules/cart/api/delete-cart";
import { useGetAddresses } from "@/modules/address/api/get-address";

import { useCreateOrder } from "../../api/add-order";
import { Confirmation } from "../../components/checkout/confirmation";
import { OrderSummary } from "../../components/checkout/orderSumary";
import { PaymentMethod } from "../../components/checkout/paymentMethod";
import { ShippingForm } from "../../components/checkout/shippingForm";
import { ShippingMethod } from "../../components/checkout/shippingMethod";
import { Stepper } from "../../components/checkout/stepper";
import { useCheckout, type ShippingMethodType } from "../../hook/useCheckout";

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

export default function CheckOutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: addresses } = useGetAddresses();
  const createOrderMutation = useCreateOrder();
  const deleteCartMutation = useDeleteCartItem();

  const cartItems = (location.state?.items as CheckoutLocationItem[] | undefined) || [];

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

  const handleShippingChange = (id: string) => {
    state.setShipping(id as ShippingMethodType);
  };

  const handlePlaceOrder = async () => {
    if (!state.shippingAddress) {
      toast.error("Chọn địa chỉ giao hàng trước");
      return;
    }

    try {
      const user = getStoredStorefrontUser<{ id: number }>();
      if (!user) {
        toast.error("Bạn cần đăng nhập để đặt hàng");
        return;
      }

      const validItems = checkoutItems.filter((item) => item.productId > 0 && item.shopId > 0);
      if (!validItems.length) {
        toast.error("Dữ liệu sản phẩm không hợp lệ");
        return;
      }

      const payload = {
        userId: user.id,
        subtotal: state.subtotal,
        shippingFee: state.shippingPrice,
        discountAmount: 0,
        totalAmount: state.total,
        shippingAddressId: state.shippingAddress.id,
        items: validItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          shopId: item.shopId,
          quantity: item.quantity,
          price: item.price,
        })),
        payment: {
          method: state.payment,
          status: "PENDING",
        },
      };

      const createdOrder = await createOrderMutation.mutateAsync(payload);

      await Promise.all(
        checkoutItems
          .map((item) => item.cartItemId)
          .filter(Boolean)
          .map((cartItemId) => deleteCartMutation.mutateAsync(Number(cartItemId))),
      );

      toast.success("Đặt hàng thành công");
      navigate(`/orders/${createdOrder.id}`);
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
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(238,77,45,0.16),_transparent_36%),linear-gradient(135deg,#111827,#1f2937)] px-6 py-8 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-orange-200">Checkout Flow</p>
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
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <Stepper step={state.step} />
            </div>

            {state.step === 1 ? (
              <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
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
              <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
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
              <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <PaymentMethod
                  value={state.payment}
                  onChange={state.setPayment}
                  methods={[
                    { id: "COD", name: "Thanh toán khi nhận hàng" },
                    { id: "VNPAY", name: "VNPAY" },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => state.setStep(4)}
                  className="h-11 w-full rounded-full bg-[#ee4d2d] font-semibold text-white transition hover:bg-[#d93f21]"
                >
                  Xem lại hóa đơn
                </button>
              </div>
            ) : null}

            {state.step === 4 ? (
              <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <Confirmation
                  total={state.total}
                  onSubmit={handlePlaceOrder}
                  loading={createOrderMutation.isPending || deleteCartMutation.isPending}
                />
              </div>
            ) : null}
          </div>

          <OrderSummary
            items={checkoutItems}
            subtotal={state.subtotal}
            total={state.total}
            shipping={state.shippingPrice}
            tax={state.tax}
          />
        </div>
      </div>
    </div>
  );
}
