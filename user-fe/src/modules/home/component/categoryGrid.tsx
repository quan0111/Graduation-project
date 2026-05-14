import { Grid2x2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

import type { ICategory } from "@/modules/category/types";
import { SectionHeading } from "@/modules/home/component/sectionHeading";
import { Button } from "@/components/ui/button";

interface CategoryGridProps {
  categories: ICategory[];
}

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    loop: false,
  });

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Danh mục"
          title="Dễ tìm sản phẩm đúng nhu cầu"
          description="Sắp xếp theo nhóm rõ ràng để bạn lọc nhanh ngay từ trang chủ."
        />

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
                  className="group shrink-0 w-[calc(50%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-14px)] rounded-2xl border border-orange-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-orange-50 p-2 text-orange-600">
                    <Grid2x2 className="h-4 w-4" />
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full border-orange-200 bg-white shadow-md hover:bg-orange-50 hover:border-orange-300 hidden md:flex"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full border-orange-200 bg-white shadow-md hover:bg-orange-50 hover:border-orange-300 hidden md:flex"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
