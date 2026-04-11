import { HomeContainer } from "../component/HomeContainer";

import type { IProduct } from "@/modules/product/types";
import type { ICategory } from "@/modules/category/types";
import type { Category } from "@/modules/category/api/category";

import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import { useGetProduct } from "@/modules/product/api/get-product";
import { useGetCategories } from "@/modules/category/api/category";

// Transform Category API response to ICategory format
const transformCategory = (cat: Category): ICategory => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug,
  parent_id: cat.parentId,
  created_at: cat.createdAt,
  updated_at: cat.updatedAt,
  Parent: cat.parent ? transformCategory(cat.parent) : undefined,
  Children: cat.children?.map(transformCategory),
});

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
  const { data: productsData, isLoading: productsLoading } = useGetProduct();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategories();

  // Transform API data to match the expected format
  const products: IProduct[] = productsData?.data?.data || [];
  const categories: ICategory[] = (categoriesData || []).map(transformCategory);

  const featuredProducts = products.slice(0, 8);

  // Show loading state if either API is loading
  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <HomeContainer
      categories={categories}
      features={features}
      products={featuredProducts}
    />
  );
}