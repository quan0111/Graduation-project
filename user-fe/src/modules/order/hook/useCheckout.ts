import { useState, useMemo } from "react";
import type { PaymentMethodType } from "../types";

/* ---------- types ---------- */

type StepType = 1 | 2 | 3 | 4;

export type ShippingMethodType =
  | "STANDARD"
  | "EXPRESS"
  | "SAME_DAY";

export interface IShippingAddress {
  id: number;
  fullName: string;
  phone: string;
  addressLine: string;
}

/* ---------- constants ---------- */

const SHIPPING_PRICE: Record<ShippingMethodType, number> = {
  STANDARD: 30000,
  EXPRESS: 50000,
  SAME_DAY: 99000,
};

/* ---------- hook ---------- */

type CheckoutPricingItem = {
  price: number;
  quantity: number;
};

export const useCheckout = (items: CheckoutPricingItem[]) => {
  const [step, setStep] = useState<StepType>(1);

  const [shipping, setShipping] =
    useState<ShippingMethodType>("STANDARD");

  const [payment, setPayment] =
    useState<PaymentMethodType>("COD");

  const [shippingAddress, setShippingAddress] =
    useState<IShippingAddress | null>(null);

  /* subtotal */
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      ),
    [items]
  );

  /* shipping */
  const shippingPrice = useMemo(
    () => SHIPPING_PRICE[shipping],
    [shipping]
  );

  /* tax */
  const tax = useMemo(
    () => Math.round(subtotal * 0.1),
    [subtotal]
  );

  /* total */
  const total = useMemo(
    () => subtotal + shippingPrice + tax,
    [subtotal, shippingPrice, tax]
  );

  return {
    step,
    setStep,

    shipping,
    setShipping,

    payment,
    setPayment,

    shippingAddress,
    setShippingAddress,

    subtotal,
    shippingPrice,
    tax,
    total,
  };
};
