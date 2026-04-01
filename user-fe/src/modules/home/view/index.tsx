import { HomeContainer } from "../component/HomeContainer";

import type { IProduct } from "@/modules/product/types";
import type { ICategory } from "@/modules/category/types";

import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

/* ---------- MOCK DATA ---------- */

const now = new Date().toISOString();

const createProduct = (id: number, name: string, price: number): IProduct => ({
  id: String(id),
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  description: "Sản phẩm chất lượng cao",

  price,
  shop_id: id % 2 === 0 ? 2 : 1,
  category_id: (id % 3) + 1,

  status: "ACTIVE",

  created_at: now,
  updated_at: now,

  Images: [
    {
      id,
      url: `https://picsum.photos/300/300?random=${id}`,
      position: 1,
      is_primary: true,
      product_id: id,
      created_at: now,
    },
  ],

  Variants: [
    {
      id,
      name: "Default",
      stock: 10 + id,
      price,
      product_id: id,
      created_at: now,
      updated_at: now,
      VariantImage: [],
    },
  ],

  Category: {
    id: (id % 3) + 1,
    name: ["Áo", "Quần", "Giày"][id % 3],
    created_at: "",
    updated_at: "",
  },

  Shop: {
    id: id % 2 === 0 ? 2 : 1,
    name: id % 2 === 0 ? "Fashion Store" : "Local Brand",
  } as any,

  Attributes: [],
  Tags: [],
  Review: [],
});

const mockProducts: IProduct[] = [
  createProduct(1, "Áo thun basic", 120000),
  createProduct(2, "Quần jean slim fit", 350000),
  createProduct(3, "Giày sneaker trắng", 890000),
  createProduct(4, "Áo hoodie oversize", 450000),
  createProduct(5, "Quần short thể thao", 180000),
  createProduct(6, "Giày chạy bộ", 1200000),
  createProduct(7, "Áo sơ mi form rộng", 320000),
  createProduct(8, "Dép sandal", 150000),
];
const mockCategories: ICategory[] = [
  {
    id:1,
    name: "Áo",
    created_at: "",
    updated_at: "",
  },
  {
    id: 2,
    name: "Quần",
    created_at: "",
    updated_at: "",
  },
  {
    id: 3,
    name: "Giày",
    created_at: "",
    updated_at: "",
  },
];

/* ---------- FEATURES ---------- */

const features = [
  {
    id: 1,
    icon: <Truck />,
    title: "Miễn phí vận chuyển",
    description: "Cho đơn hàng từ 300k",
  },
  {
    id: 2,
    icon: <ShieldCheck />,
    title: "Bảo hành chính hãng",
    description: "Cam kết 100% chính hãng",
  },
  {
    id: 3,
    icon: <RefreshCw />,
    title: "Đổi trả dễ dàng",
    description: "Trong vòng 7 ngày",
  },
  {
    id: 4,
    icon: <Headphones />,
    title: "Hỗ trợ 24/7",
    description: "Luôn sẵn sàng hỗ trợ",
  },
];

/* ---------- PAGE ---------- */

export default function HomePage() {
  const products = mockProducts;
  const categories = mockCategories;

  const featuredProducts = products.slice(0, 8);

  return (
    <HomeContainer
      categories={categories}
      features={features}
      products={featuredProducts}
    />
  );
}