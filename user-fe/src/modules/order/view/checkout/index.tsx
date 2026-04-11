import { useGetCart } from "@/modules/cart/api/get-cart";
import { useGetAddresses } from "@/modules/address/api/address";
import { useCreateOrder } from "@/modules/order/api/add-order";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCheckout } from "../../hook/useCheckout";
import type {
  IOrderItem,
  PaymentMethodType,
} from "../../types";

import { Stepper } from "../../components/checkout/stepper";
import { ShippingForm } from "../../components/checkout/shippingForm";
import { ShippingMethod } from "../../components/checkout/shippingMethod";
import { PaymentMethod } from "../../components/checkout/paymentMethod";
import { Confirmation } from "../../components/checkout/confirmation";
import { OrderSummary } from "../../components/checkout/orderSumary";

/* ---------- shipping ---------- */

type ShippingMethodType = "STANDARD" | "EXPRESS" | "SAME_DAY";

const shippingMethods: {
  id: ShippingMethodType;
  name: string;
  time: string;
}[] = [
  { id: "STANDARD", name: "Tiêu chuẩn", time: "3-5 ngày" },
  { id: "EXPRESS", name: "Nhanh", time: "1-2 ngày" },
  { id: "SAME_DAY", name: "Trong ngày", time: "2-6h" },
];

/* ---------- payment ---------- */

const paymentMethods: {
  id: PaymentMethodType;
  name: string;
}[] = [
  { id: "COD", name: "Thanh toán khi nhận hàng" },
  { id: "VNPAY", name: "VNPay" },
  { id: "STRIPE", name: "Stripe" },
];

/* ---------- page ---------- */

export default function CheckOutPage() {
  const navigate = useNavigate();
  
  // API hooks
  const { data: cartData, isLoading: cartLoading } = useGetCart();
  const { data: addresses } = useGetAddresses();
  const createOrderMutation = useCreateOrder();

  // Transform cart data to order items
  const checkoutItems: IOrderItem[] = (cartData?.data?.data?.[0]?.items || []).map((item: any) => ({
    id: item.id,
    order_id: 0, // Will be set when order is created
    product_id: Number(item.product_id),
    quantity: item.quantity,
    price: item.variant?.price || item.product?.price || 0,
    product_name: item.product?.name || "Sản phẩm",
    product_image: item.product?.Images?.[0]?.url || "/placeholder.png",
    created_at: "",
  }));

  const state = useCheckout(checkoutItems);

  // Handle place order
  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        items: checkoutItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_address: state.shippingAddress,
        shipping_method: state.shipping,
        payment_method: state.payment,
        total_amount: state.total,
      };

      await createOrderMutation.mutateAsync(orderData);
      toast.success("Đặt hàng thành công!");
      navigate("/orders");
    } catch (error) {
      toast.error("Đặt hàng thất bại. Vui lòng thử lại.");
      console.error("Order error:", error);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    navigate("/cart");
    return null;
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
            onNext={(data) => {
              console.log("shipping info:", data);
              state.setStep(2);
            }}
          />
        )}

        {/* STEP 2 */}
        {state.step === 2 && (
          <>
            <ShippingMethod
              value={state.shipping}
              onChange={(value) => state.setShipping(value as ShippingMethodType)}
              methods={shippingMethods}
            />

            <button
              onClick={() => state.setStep(3)}
              className="btn-primary w-full"
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
              methods={paymentMethods}
            />

            <button
              onClick={() => state.setStep(4)}
              className="btn-primary w-full"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </>
        )}

        {/* STEP 4 */}
        {state.step === 4 && (
          <Confirmation total={state.total} />
        )}
      </div>

      {/* RIGHT */}
      <OrderSummary
        items={checkoutItems}
        total={state.total}
        subtotal={state.subtotal}
        tax={state.tax}
        shipping={state.shippingPrice}
      />
    </div>
  );
}