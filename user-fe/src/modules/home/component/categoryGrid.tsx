import { Grid2x2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { ICategory } from "@/modules/category/types";
import { SectionHeading } from "@/modules/home/component/sectionHeading";

interface CategoryGridProps {
  categories: ICategory[];
}

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Danh mục"
          title="Dễ tìm sản phẩm đúng nhu cầu"
          description="Sắp xếp theo nhóm rõ ràng để bạn lọc nhanh ngay từ trang chủ."
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
              className="group rounded-2xl border border-orange-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-xl bg-orange-50 p-2 text-orange-600">
                <Grid2x2 className="h-4 w-4" />
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">{category.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
