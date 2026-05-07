export type WizardStep = "media" | "detail" | "selling" | "shipping";

export type UploadedImage = {
  url: string;
  position: number;
  isPrimary: boolean;
};

export type AttributeRow = {
  key: string;
  value: string;
};

export type VariantGroup = {
  name: string;
  values: string[];
};

export type VariantDraft = {
  key: string;
  name: string;
  optionMap: Record<string, string>;
  sku: string;
  price: number;
  stock: number;
  weight: number;
  imageUrl: string;
};

export type ShippingDraft = {
  weightMode: "per-variant" | "shop-default";
  packageLength: string;
  packageWidth: string;
  packageHeight: string;
  packageWeight: string;
  shippingNote: string;
};

export type Category = {
  id: number;
  name: string;
  slug?: string | null;
};