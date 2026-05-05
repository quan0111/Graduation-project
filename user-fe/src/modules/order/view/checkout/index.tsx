import { useCart } from "@/modules/cart/api/get-cart";
import { useGetAddresses } from "@/modules/address/api/address";
import { useCreateOrder } from "@/modules/order/api/add-order";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCheckout } from "../../hook/useCheckout";

import { Stepper } from "../../components/checkout/stepper";
import { ShippingForm } from "../../components/checkout/shippingForm";
import { ShippingMethod } from "../../components/checkout/shippingMethod";
import { PaymentMethod } from "../../components/checkout/paymentMethod";
import { Confirmation } from "../../components/checkout/confirmation";
import { OrderSummary } from "../../components/checkout/orderSumary";

export default function CheckOutPage() {
  const navigate = useNavigate();

  const { data: cartData, isLoading } = useCart();
  const { data: addresses } = useGetAddresses();
  const createOrderMutation = useCreateOrder();

  const cartItems = cartData?.items || [];

  /* 🔥 TRANSFORM */
  const checkoutItems = cartItems.map((item: any) => ({
    productId: item.product_id,
    quantity: item.quantity,
    price: item.variant?.price || item.product?.price || 0,
  }));

  const state = useCheckout(cartItems as any);

  /* 🔥 CREATE ORDER */
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

      const subtotal = checkoutItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );

      const payload = {
        userId: user.id,

        shippingFee: state.shippingPrice,
        discountAmount: 0,
        totalAmount: subtotal + state.shippingPrice,

        items: checkoutItems,

        payment: {
          method: state.payment,
        },
      };

      console.log("🚀 ORDER PAYLOAD", payload);

      await createOrderMutation.mutateAsync(payload);

      toast.success("Đặt hàng thành công");
      navigate("/orders");

    } catch (err) {
      console.error(err);
      toast.error("Lỗi tạo đơn");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2 space-y-6">
        <Stepper step={state.step} />

        {state.step === 1 && (
          <ShippingForm
            addresses={addresses || []}
            onNext={(a) => {
              state.setShippingAddress(a);
              state.setStep(2);
            }}
          />
        )}

        {state.step === 2 && (
          <>
            <ShippingMethod
              value={state.shipping}
              onChange={(v) => state.setShipping(v as any)}
              methods={[]}
            />
            <button onClick={() => state.setStep(3)}>
              Tiếp tục
            </button>
          </>
        )}

        {state.step === 3 && (
          <>
            <PaymentMethod
              value={state.payment}
              onChange={state.setPayment}
              methods={[]}
            />
            <button onClick={() => state.setStep(4)}>
              Tiếp tục
            </button>
          </>
        )}

        {state.step === 4 && (
          <Confirmation
            total={state.total}
            onSubmit={handlePlaceOrder}
            loading={createOrderMutation.isPending}
          />
        )}
      </div>

      <OrderSummary
        items={cartItems as any}
        total={state.total}
        subtotal={state.subtotal}
        tax={state.tax}
        shipping={state.shippingPrice}
      />
    </div>
  );
}