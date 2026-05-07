import type { WizardStep } from "../types/addproduct";

export const STEPS: Array<{ id: WizardStep; label: string; description: string }> = [
  { id: "media", label: "1. Hinh anh va ten", description: "Anh, ten san pham, nganh hang" },
  { id: "detail", label: "2. Thong tin chi tiet", description: "Thuoc tinh va mo ta" },
  { id: "selling", label: "3. Thong tin ban hang", description: "Phan loai, gia, kho" },
  { id: "shipping", label: "4. Van chuyen", description: "Thong tin tam thoi" },
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}