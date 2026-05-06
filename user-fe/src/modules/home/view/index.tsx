'use client';

import { HomeContainer } from "../component/HomeContainer";

import type { IProduct } from "@/modules/product/types";
import type { ICategory } from "@/modules/category/types";
import type { Category } from "@/modules/category/api/category";

import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

import { useGetProduct } from "@/modules/product/api/get-product";
import { useGetCategories } from "@/modules/category/api/category";

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

const transformProduct = (p: any): IProduct => ({
  id: p.id,
  name: p.name,
  price: p.price,
  images: p.images|| [],
  shop_id: p.shopId,
  status: p.status,
  updated_at: p.updatedAt,
  category: p.category,
  created_at: p.createdAt,
  category_id: p.categoryId,
});


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


export default function HomePage() {
  const {
    data: productsRes,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProduct();

  const {
    data: categoriesRes,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategories();


  const products: IProduct[] =
    (productsRes as unknown as IProduct[])?.map(transformProduct) || [];

  const categories: ICategory[] =
    (categoriesRes || []).map(transformCategory);



  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (productsError || categoriesError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Lỗi tải dữ liệu 😢
      </div>
    );
  }

  // ================= UI =================

  return (
    <HomeContainer
      categories={categories}
      features={features}
      products={products}
    />
  );
}