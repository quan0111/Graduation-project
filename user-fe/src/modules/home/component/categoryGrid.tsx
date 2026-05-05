// components/CategoryGrid.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { ICategory } from "@/modules/category/types";



interface CategoryGridProps {
  categories: ICategory[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-2xl font-bold mb-6">
          Danh mục sản phẩm
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${encodeURIComponent(c.slug || c.name)}`}
            >
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="text-center p-4 space-y-2">

                  {/* Icon */}
                  <div className="text-3xl">
                    {c.name || "📦"}
                  </div>

                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};