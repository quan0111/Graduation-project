'use client';

import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Truck, Zap, Archive } from "lucide-react";

import { useCreateOrder } from "@/modules/order/api/add-order";
import { useGetAddresses } from "@/modules/address/api/get-address";
import { useCheckout } from "../../hook/useCheckout";

import { Stepper } from "../../components/checkout/stepper";
import { ShippingForm } from "../../components/checkout/shippingForm";
import { ShippingMethod } from "../../components/checkout/shippingMethod";
import { PaymentMethod } from "../../components/checkout/paymentMethod";
import { Confirmation } from "../../components/checkout/confirmation";
import { OrderSummary } from "../../components/checkout/orderSumary";

export default function CheckOutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: addresses } = useGetAddresses();
  const createOrderMutation = useCreateOrder();

  // 🔥 DATA TỪ CART
  const cartItems = location.state?.items || [];

  const state = useCheckout(cartItems as any);

  /* ================= SHIPPING ================= */
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
      name: "Hỏa tốc",
      time: "2-4 giờ",
      fee: 50000,
      icon: <Zap size={18} />,
    },
    {
      id: "SAME_DAY",
      name: "Trong ngày",
      time: "Hôm nay",
      fee: 99000,
      icon: <Archive size={18} />,
    },
  ];

  /* ================= TRANSFORM (FIX CHÍNH) ================= */
  const checkoutItems = cartItems.map((item: any) => ({
    productId: Number(item.productId || 0),  
    variantId: item.variantId || null,       
    shopId: Number(item.shopId || 0),        
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
  }));

  /* ================= SUBTOTAL ================= */
  const subtotal = checkoutItems.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  );

  /* ================= SHIPPING CHANGE ================= */
  const handleShippingChange = (id: string) => {
    state.setShipping(id as any);
  };

  /* ================= ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!state.shippingAddress) {
      toast.error("Chọn địa chỉ trước");
      return;
    }

    try {
      const raw = localStorage.getItem("auth-storage");
      const user = raw ? JSON.parse(raw)?.state?.user : null;

      if (!user) {
        toast.error("Chưa đăng nhập");
        return;
      }

      // 🔥 VALIDATE ITEMS (TRÁNH BUG NGẦM)
      const validItems = checkoutItems.filter(
        (i: { productId: number; shopId: number; }) => i.productId > 0 && i.shopId > 0
      );

      if (!validItems.length) {
        toast.error("Dữ liệu sản phẩm lỗi");
        return;
      }

      const payload = {
        userId: user.id,
        subtotal,
        shippingFee: state.shippingPrice,
        discountAmount: 0,
        totalAmount: subtotal + state.shippingPrice + state.tax,

        items: validItems,

        payment: {
          method: state.payment,
          status: "PENDING",
        },
      };

      console.log("🚀 ORDER PAYLOAD FIXED", payload);

      await createOrderMutation.mutateAsync(payload);

      toast.success("Đặt hàng thành công");
      navigate("/orders");

    } catch (err) {
      console.error(err);
      toast.error("Lỗi tạo đơn");
    }
  };

  if (!cartItems.length) {
    return <div className="p-6">Không có sản phẩm để thanh toán</div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 p-6">

      {/* LEFT */}
      <div className="lg:col-span-2 space-y-6">

        <Stepper step={state.step} />

        {/* STEP 1 */}
        {state.step === 1 && (
          <ShippingForm
            addresses={addresses || []}
            onNext={(a) => {
              state.setShippingAddress(a);
              state.setStep(2);
            }}
          />
        )}

        {/* STEP 2 */}
        {state.step === 2 && (
          <>
            <ShippingMethod
              value={state.shipping}
              onChange={handleShippingChange}
              methods={shippingMethods}
            />

            <button
              onClick={() => state.setStep(3)}
              className="w-full py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 shadow-md"
            >
              Tiếp tục
            </button>
          </>
        )}

        {/* STEP 3 */}
        {state.step === 3 && (
          <>
            <PaymentMethod
              value={state.payment}
              onChange={state.setPayment}
              methods={[
                { id: "COD", name: "Thanh toán khi nhận hàng" },
                { id: "VNPAY", name: "VNPAY" },
              ]}
            />

            <button
              onClick={() => state.setStep(4)}
              className="w-full py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 shadow-md"
            >
              Tiếp tục
            </button>
          </>
        )}

        {/* STEP 4 */}
        {state.step === 4 && (
          <Confirmation
            total={state.total}
            onSubmit={handlePlaceOrder}
            loading={createOrderMutation.isPending}
          />
        )}
      </div>

      {/* RIGHT */}
      <OrderSummary
        items={cartItems}
        subtotal={state.subtotal}
        total={state.total}
        shipping={state.shippingPrice}
        tax={state.tax}
      />
    </div>
  );
}