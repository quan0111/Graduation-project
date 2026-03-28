// hooks/useCheckout.ts
import { useState, useMemo } from "react";

export const useCheckout = (items) => {
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("credit");

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  const shippingPrice = useMemo(() => {
    const map = {
      standard: 30000,
      express: 50000,
      sameday: 99000,
    };
    return map[shipping];
  }, [shipping]);

  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shippingPrice + tax;

  return {
    step,
    setStep,
    shipping,
    setShipping,
    payment,
    setPayment,
    subtotal,
    shippingPrice,
    tax,
    total,
  };
};