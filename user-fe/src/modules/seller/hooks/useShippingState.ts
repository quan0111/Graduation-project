import { useState } from "react";

import type { ShippingDraft } from "../types/addproduct";

export function useShippingState() {
  const [shipping, setShipping] = useState<ShippingDraft>({
    weightMode: "per-variant",
    packageLength: "",
    packageWidth: "",
    packageHeight: "",
    packageWeight: "",
    shippingNote: "",
  });

  return {
    shipping,
    setShipping,
  };
}
