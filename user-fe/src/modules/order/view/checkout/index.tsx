// page.tsx
import { useCheckout } from "@/hooks/useCheckout";

export default function Page() {
  const state = useCheckout(checkoutItems);

  return (
    <div className="grid lg:grid-cols-3 gap-8 p-6">

      <div className="lg:col-span-2 space-y-6">

        <Stepper step={state.step} />

        {state.step === 1 && (
          <ShippingForm onNext={() => state.setStep(2)} />
        )}

        {state.step === 2 && (
          <ShippingMethod
            value={state.shipping}
            onChange={state.setShipping}
            methods={shippingMethods}
          />
        )}

        {state.step === 3 && (
          <PaymentMethod
            value={state.payment}
            onChange={state.setPayment}
            methods={paymentMethods}
          />
        )}

        {state.step === 4 && (
          <Confirmation total={state.total} />
        )}

      </div>

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