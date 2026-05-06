import { PackageCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { SellerDashboardInventoryItem, SellerDashboardTopProduct } from "../../types/dashboard";
import {
  formatCurrency,
  formatShortDateTime,
  getProductStatusLabel,
  getProductStatusTone,
} from "../../utils/dashboard";

interface SellerDashboardTopProductsCardProps {
  products: SellerDashboardTopProduct[];
}

interface SellerDashboardInventoryCardProps {
  inventory: SellerDashboardInventoryItem[];
}

export function SellerDashboardTopProductsCard({
  products,
}: SellerDashboardTopProductsCardProps) {
  return (
    <Card id="products" className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-slate-950">Sản phẩm bán chạy</CardTitle>
          <p className="text-sm text-slate-500">Xếp hạng theo doanh thu từ dữ liệu đơn hàng</p>
        </div>
        <Button variant="ghost" size="sm" className="text-[#ee4d2d]">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                <th className="px-4 py-3 font-semibold">Đã bán</th>
                <th className="px-4 py-3 font-semibold">Tồn kho</th>
                <th className="px-4 py-3 font-semibold">Doanh thu</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="bg-white">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#ee4d2d]">
                        <PackageCheck className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{product.sold}</td>
                  <td className="px-4 py-4 text-slate-600">{product.stock}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(product.revenue)}</td>
                  <td className="px-4 py-4">
                    <Badge className={cn("bg-transparent", getProductStatusTone(product.status, product.stock))}>
                      {getProductStatusLabel(product.status, product.stock)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function SellerDashboardInventoryCard({ inventory }: SellerDashboardInventoryCardProps) {
  return (
    <Card id="shipping" className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-950">Tồn kho cần chú ý</CardTitle>
        <p className="text-sm text-slate-500">Sắp xếp theo số lượng tồn thấp nhất</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {inventory.map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">Cập nhật {formatShortDateTime(item.updatedAt)}</p>
              </div>
              <Badge className={cn("bg-transparent", getProductStatusTone(item.status, item.stock))}>
                {getProductStatusLabel(item.status, item.stock)}
              </Badge>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">Tồn kho: {item.stock}</span>
              <span className="font-semibold text-slate-900">{formatCurrency(item.price)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
