// components/HeroSection.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="bg-linear-to-r from-primary via-purple-600 to-accent text-white py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 px-4">
        
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-4xl font-bold mb-4">
              Khám phá hàng triệu sản phẩm
            </h1>

            <p className="mb-6">
              Giá tốt - Giao nhanh - Uy tín
            </p>

            <Link to="/products">
              <Button>Shop ngay</Button>
            </Link>
          </div>

          <img
            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"
            className="rounded-lg object-cover w-full max-w-md h-48 md:h-full mx-auto"
          />
      </div>
    </section>
  );
};
