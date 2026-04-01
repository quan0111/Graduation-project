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

/* ---------- mock data ---------- */

const checkoutItems: IOrderItem[] = [
  {
    id: 1,
    order_id: 1,
    product_id: 1,
    quantity: 2,
    price: 120000,
    product_name: "Áo thun",
    product_image: "/placeholder.png",
    created_at: "",
  },
];

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
  const state = useCheckout(checkoutItems);

  return (
    <div className="grid lg:grid-cols-3 gap-8 p-6">
      {/* LEFT */}
      <div className="lg:col-span-2 space-y-6">
        <Stepper step={state.step} />

        {/* STEP 1 */}
        {state.step === 1 && (
          <ShippingForm
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
            >
              Xác nhận
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