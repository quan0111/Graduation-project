import { Link } from "react-router-dom";
import { Package2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const EmptyState = () => {
  return (
    <div className="rounded-4xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-orange-50 text-[#ee4d2d]">
        <Package2 className="size-8" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-950">Chưa có đơn hàng nào</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Khi bạn hoàn tất checkout, hóa đơn và trạng thái vận chuyển sẽ xuất hiện tại đây.
      </p>
      <Link to="/products" className={`${buttonVariants()} mt-6 inline-flex bg-[#ee4d2d] hover:bg-[#d93f21]`}>
        Tiếp tục mua sắm
      </Link>
    </div>
  );
};
