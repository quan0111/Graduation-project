import { Compass } from "lucide-react";

interface CatalogHeaderProps {
  totalProducts: number;
}

export const CatalogHeader = ({ totalProducts }: CatalogHeaderProps) => {
  return (
    <section className="rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-orange-500">Product Discovery</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Khám phá sản phẩm phù hợp</h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Duyệt danh mục, lọc nhanh theo ngân sách và xem đề xuất cập nhật theo hành vi của bạn.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm text-slate-700">
          <Compass className="h-4 w-4 text-orange-500" />
          <span>{totalProducts} sản phẩm đang có sẵn</span>
        </div>
      </div>
    </section>
  );
};
