import { Headphones, RefreshCw, ShieldCheck, Truck } from "lucide-react";

import type { Category } from "@/modules/category/api/category";
import { useGetCategories } from "@/modules/category/api/category";
import { HomeContainer } from "@/modules/home/component/HomeContainer";
import type { ICategory } from "@/modules/category/types";
import type { IProduct } from "@/modules/product/types";
import { useGetProduct } from "@/modules/product/api/get-product";
import { normalizeProduct } from "@/modules/product/utils/normalize-product";
import { useRecommendations } from "@/modules/recommendation/api/get-recommendations";
import { useTrackProductBehavior } from "@/modules/recommendation/hooks/useTrackProductBehavior";

const transformCategory = (category: Category): ICategory => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  parent_id: category.parentId,
  created_at: category.createdAt,
  updated_at: category.updatedAt,
  Parent: category.parent ? transformCategory(category.parent) : undefined,
  Children: category.children?.map(transformCategory),
});

const features = [
  {
    id: 1,
    icon: <Truck className="h-5 w-5" />,
    title: "Miễn phí vận chuyển",
    description: "Cho đơn hàng từ 300.000đ trên toàn quốc",
  },
  {
    id: 2,
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Cam kết chính hãng",
    description: "Kiểm duyệt người bán và chính sách hoàn tiền rõ ràng",
  },
  {
    id: 3,
    icon: <RefreshCw className="h-5 w-5" />,
    title: "Đổi trả linh hoạt",
    description: "Hỗ trợ đổi trả trong vòng 7 ngày làm việc",
  },
  {
    id: 4,
    icon: <Headphones className="h-5 w-5" />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ CSKH sẵn sàng xử lý mọi vấn đề của bạn",
  },
];

export default function HomePage() {
  const { data: rawProducts = [], isLoading: productsLoading, isError: productsError } = useGetProduct();
  const { data: categoriesRes = [], isLoading: categoriesLoading, isError: categoriesError } = useGetCategories();
  const { data: recommendedProducts = [], isLoading: recommendationLoading } = useRecommendations({ topK: 10 });
  const { trackClick } = useTrackProductBehavior();

  const products: IProduct[] = rawProducts.map((product) => normalizeProduct(product as Record<string, unknown>));
  const categories: ICategory[] = categoriesRes.map(transformCategory);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (productsError || categoriesError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-red-500">
        Không thể tải dữ liệu trang chủ.
      </div>
    );
  }

  return (
    <HomeContainer
      categories={categories}
      features={features}
      products={products.slice(0, 10)}
      recommendedProducts={recommendedProducts}
      isRecommendationLoading={recommendationLoading}
      onProductClick={(product, source) => trackClick(product.id, { source, page: "home" })}
    />
  );
}
