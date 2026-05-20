import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { FlashSale, FlashSaleItemCreatePayload } from "../types";
import { getApiErrorMessage } from "../utils/error";

type FlashSaleItemFormState = {
  productId: string;
  variantId: string;
  shopId: string;
  salePrice: string;
  stockLimit: string;
  purchaseLimit: string;
};

type Props = {
  sale: FlashSale | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: FlashSaleItemCreatePayload) => Promise<void>;
};

const COPY = {
  title: "Th\u00eam s\u1ea3n ph\u1ea9m flash sale",
  description: "Nh\u1eadp ID s\u1ea3n ph\u1ea9m, shop, gi\u00e1 flash sale v\u00e0 gi\u1edbi h\u1ea1n t\u1ed3n cho ch\u01b0\u01a1ng tr\u00ecnh.",
  productId: "Product ID",
  variantId: "Variant ID",
  shopId: "Shop ID",
  salePrice: "Gi\u00e1 flash sale",
  stockLimit: "Gi\u1edbi h\u1ea1n t\u1ed3n",
  purchaseLimit: "Gi\u1edbi h\u1ea1n mua",
  cancel: "H\u1ee7y",
  submit: "Th\u00eam s\u1ea3n ph\u1ea9m",
  submitting: "\u0110ang th\u00eam...",
  required: "Product ID, Shop ID v\u00e0 gi\u00e1 flash sale l\u00e0 b\u1eaft bu\u1ed9c.",
  invalidProduct: "Product ID ph\u1ea3i l\u00e0 s\u1ed1 nguy\u00ean d\u01b0\u01a1ng.",
  invalidShop: "Shop ID ph\u1ea3i l\u00e0 s\u1ed1 nguy\u00ean d\u01b0\u01a1ng.",
  invalidVariant: "Variant ID ph\u1ea3i l\u00e0 s\u1ed1 nguy\u00ean d\u01b0\u01a1ng ho\u1eb7c \u0111\u1ec3 tr\u1ed1ng.",
  invalidPrice: "Gi\u00e1 flash sale ph\u1ea3i l\u1edbn h\u01a1n 0.",
  invalidStock: "Gi\u1edbi h\u1ea1n t\u1ed3n ph\u1ea3i l\u00e0 s\u1ed1 nguy\u00ean d\u01b0\u01a1ng ho\u1eb7c \u0111\u1ec3 tr\u1ed1ng.",
  invalidPurchase: "Gi\u1edbi h\u1ea1n mua ph\u1ea3i l\u00e0 s\u1ed1 nguy\u00ean d\u01b0\u01a1ng ho\u1eb7c \u0111\u1ec3 tr\u1ed1ng.",
  failed: "Th\u00eam s\u1ea3n ph\u1ea9m flash sale th\u1ea5t b\u1ea1i.",
};

const INITIAL_FORM: FlashSaleItemFormState = {
  productId: "",
  variantId: "",
  shopId: "",
  salePrice: "",
  stockLimit: "",
  purchaseLimit: "",
};

const readOptionalPositiveInteger = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
};

export function FlashSaleItemDialog({ sale, pending = false, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<FlashSaleItemFormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const open = Boolean(sale);

  useEffect(() => {
    if (open) {
      setForm({ ...INITIAL_FORM });
      setError(null);
    }
  }, [open, sale?.id]);

  const updateField = (field: keyof FlashSaleItemFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.productId.trim() || !form.shopId.trim() || !form.salePrice.trim()) {
      setError(COPY.required);
      return;
    }

    const productId = Number(form.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      setError(COPY.invalidProduct);
      return;
    }

    const shopId = Number(form.shopId);
    if (!Number.isInteger(shopId) || shopId <= 0) {
      setError(COPY.invalidShop);
      return;
    }

    const variantId = readOptionalPositiveInteger(form.variantId);
    if (variantId === undefined) {
      setError(COPY.invalidVariant);
      return;
    }

    const salePrice = Number(form.salePrice);
    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      setError(COPY.invalidPrice);
      return;
    }

    const stockLimit = readOptionalPositiveInteger(form.stockLimit);
    if (stockLimit === undefined) {
      setError(COPY.invalidStock);
      return;
    }

    const purchaseLimit = readOptionalPositiveInteger(form.purchaseLimit);
    if (purchaseLimit === undefined) {
      setError(COPY.invalidPurchase);
      return;
    }

    try {
      await onSubmit({
        productId,
        shopId,
        variantId,
        salePrice,
        stockLimit,
        purchaseLimit,
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, COPY.failed));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>
            {sale?.name ? `${sale.name}. ${COPY.description}` : COPY.description}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="flash-sale-product-id">{COPY.productId}</Label>
              <Input
                id="flash-sale-product-id"
                min={1}
                step={1}
                type="number"
                value={form.productId}
                onChange={(event) => updateField("productId", event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flash-sale-variant-id">{COPY.variantId}</Label>
              <Input
                id="flash-sale-variant-id"
                min={1}
                step={1}
                type="number"
                value={form.variantId}
                onChange={(event) => updateField("variantId", event.currentTarget.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flash-sale-shop-id">{COPY.shopId}</Label>
              <Input
                id="flash-sale-shop-id"
                min={1}
                step={1}
                type="number"
                value={form.shopId}
                onChange={(event) => updateField("shopId", event.currentTarget.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="flash-sale-price">{COPY.salePrice}</Label>
              <Input
                id="flash-sale-price"
                min={1}
                step="1000"
                type="number"
                value={form.salePrice}
                onChange={(event) => updateField("salePrice", event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flash-sale-stock-limit">{COPY.stockLimit}</Label>
              <Input
                id="flash-sale-stock-limit"
                min={1}
                step={1}
                type="number"
                value={form.stockLimit}
                onChange={(event) => updateField("stockLimit", event.currentTarget.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flash-sale-purchase-limit">{COPY.purchaseLimit}</Label>
              <Input
                id="flash-sale-purchase-limit"
                min={1}
                step={1}
                type="number"
                value={form.purchaseLimit}
                onChange={(event) => updateField("purchaseLimit", event.currentTarget.value)}
              />
            </div>
          </div>

          {error && <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              {COPY.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? COPY.submitting : COPY.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
