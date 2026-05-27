import { PackageCheck } from "lucide-react";

import type { IOrder, IOrderShopPackage } from "../types";
import { formatDateTime, getStatusMeta } from "../utils/order";

interface OrderPackageSummaryProps {
  order: IOrder;
}

const getPackages = (order: IOrder): IOrderShopPackage[] => {
  if (order.shop_package) return [order.shop_package];
  return order.packages ?? [];
};

export const OrderPackageSummary: React.FC<OrderPackageSummaryProps> = ({ order }) => {
  const packages = getPackages(order);
  if (!packages.length) return null;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <PackageCheck className="size-4 text-[#ee4d2d]" />
        <p className="text-sm font-semibold text-slate-950">Tracking theo từng shop</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {packages.map((shopPackage) => {
          const status = getStatusMeta(shopPackage.status);
          const itemCount = order.items.filter((item) => item.shop_id === shopPackage.shop_id).length;

          return (
            <div key={`${shopPackage.shop_id}-${shopPackage.id}`} className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">
                    {shopPackage.shop?.name || `Shop #${shopPackage.shop_id}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {itemCount} sản phẩm · {shopPackage.tracking_number || "Chưa có mã vận đơn"}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${status.chip}`}>
                  {status.label}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Cập nhật: {formatDateTime(shopPackage.delivered_at || shopPackage.shipped_at || shopPackage.updated_at || shopPackage.created_at)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
