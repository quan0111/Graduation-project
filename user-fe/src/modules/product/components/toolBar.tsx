import { SlidersHorizontal } from "lucide-react";

interface ProductToolbarProps {
  count: number;
  activeCategory?: string;
}

export const ProductToolbar = ({ count, activeCategory }: ProductToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Danh mục sản phẩm</p>
        <p className="text-sm text-slate-600">
          Tìm thấy <span className="font-semibold text-slate-900">{count}</span> sản phẩm
        </p>
      </div>

      <div className="flex items-center gap-2">
        {activeCategory && (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">{activeCategory}</span>
        )}
        <div className="inline-flex items-center gap-1 rounded-full border border-orange-200 px-3 py-1 text-xs text-slate-600">
          <SlidersHorizontal className="h-3.5 w-3.5 text-orange-500" />
          Bộ lọc thông minh
        </div>
      </div>
    </div>
  );
};
