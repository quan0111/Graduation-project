// components/CategoryGrid.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const CategoryGrid = ({ categories }) => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-2xl font-bold mb-6">
          Danh mục sản phẩm
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {categories.map((c, i) => (
            <Link key={i} to={`/products?category=${c.name}`}>
              <Card>
                <CardContent className="text-center">
                  <div className="text-3xl">{c.icon}</div>
                  <p>{c.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};