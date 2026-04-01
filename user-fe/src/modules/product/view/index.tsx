import { useProducts } from "../hooks/useProduct";
import type { IProduct } from "../types";
import type { IShop } from "@/modules/seller/types";

import { FilterSidebar } from "../components/sideBar";
import { ProductGrid } from "../components/productGrid";
import { ProductToolbar } from "../components/toolBar";

/* ---------- MOCK ---------- */

const now = new Date().toISOString();

const shopList = [
  { id: 1, name: "Nike Store" },
  { id: 2, name: "Adidas Shop" },
  { id: 3, name: "Local Brand" },
];

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

const createProduct = (id: number): IProduct => {
  const shop = shopList[id % shopList.length];

  const price = random(100000, 3000000);

  return {
    id: String(id),
    name: `Sản phẩm ${id}`,
    slug: `san-pham-${id}`,
    description: "Mô tả sản phẩm",

    price,
    shop_id: shop.id,
    category_id: 1,

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
        stock: random(1, 50),
        price,
        product_id: id,
        created_at: now,
        updated_at: now,
        VariantImage: [],
      },
    ],

    Shop: shop as any,

    Category: {
      id: 1,
      name: "Danh mục",
      created_at: now,
      updated_at: now,
    },

    Attributes: [],
    Tags: [],
    Review: [],
  };
};

/* 👉 tạo 40 sản phẩm */
const mockProducts: IProduct[] = Array.from({ length: 40 }, (_, i) =>
  createProduct(i + 1)
);

/* ---------- PAGE ---------- */

export default function ProductPage() {
  const products = mockProducts;

  const { products: filtered, filters, setFilters } =
    useProducts(products);

    const shops = Array.from(
      new Map(
        products
          .map((p) => p.Shop)
          .filter((shop): shop is IShop => Boolean(shop))
          .map((shop) => [shop.id, shop])
      ).values()
    );

  const priceRanges = [
    { label: "Dưới 500k", min: 0, max: 500000 },
    { label: "500k - 1M", min: 500000, max: 1000000 },
    { label: "1M - 3M", min: 1000000, max: 3000000 },
  ];

  return (
    <div className="grid lg:grid-cols-4 gap-8 p-8">
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        priceRanges={priceRanges}
        shops={shops}
      />

      <div className="lg:col-span-3">
        <ProductToolbar count={filtered.length} />
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}