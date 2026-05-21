import type { WizardStep } from "../types/addproduct";

export const STEPS: Array<{ id: WizardStep; label: string; description: string }> = [
  { id: "media", label: "1. Hình ảnh và tên", description: "Ảnh, tên sản phẩm, ngành hàng" },
  { id: "detail", label: "2. Thông tin chi tiết", description: "Thuộc tính và mô tả" },
  { id: "selling", label: "3. Thông tin bán hàng", description: "Phân loại, giá, kho" },
  { id: "shipping", label: "4. Vận chuyển", description: "Thông tin tạm thời" },
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