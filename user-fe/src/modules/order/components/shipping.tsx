import { MapPin, PackageSearch, Phone, Truck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { IOrder } from "../types";
import { formatDateTime, getStatusMeta, joinAddress } from "../utils/order";

interface OrderShippingProps {
  order: IOrder;
}

export const OrderShipping: React.FC<OrderShippingProps> = ({ order }) => {
  const shipment = order.shipment;
  const address = order.shipping_address;
  const packages = order.shop_package ? [order.shop_package] : order.packages ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-4 text-[#ee4d2d]" />
            Thông tin nhận hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-semibold text-slate-950">
              {address?.full_name || order.user?.full_name || "Khách hàng"}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Phone className="size-4" />
              {address?.phone || "Chưa có số điện thoại"}
            </p>
          </div>
          <p className="text-sm leading-6 text-slate-600">{joinAddress(address)}</p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="size-4 text-[#ee4d2d]" />
            Tracking vận chuyển
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shipment ? (
            <>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Mã vận đơn</span>
                <span className="font-semibold text-slate-950">
                  {shipment.tracking_number || "Chưa cập nhật"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Đơn vị vận chuyển</p>
                  <p className="mt-2 font-medium text-slate-950">{shipment.carrier || "Đang chờ gán"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Mốc cập nhật</p>
                  <p className="mt-2 font-medium text-slate-950">
                    {formatDateTime(shipment.delivered_at || shipment.shipped_at || shipment.created_at)}
                  </p>
                </div>
              </div>
            </>
          ) : packages.length > 0 ? (
            <div className="space-y-3">
              {packages.map((shopPackage) => {
                const meta = getStatusMeta(shopPackage.status);
                return (
                  <div key={shopPackage.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{shopPackage.shop?.name || "Package shop"}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {shopPackage.tracking_number || "Chưa cập nhật mã vận đơn"}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.chip}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Đơn vị</p>
                        <p className="mt-1 font-medium text-slate-950">{shopPackage.carrier || "Tự vận chuyển"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cập nhật</p>
                        <p className="mt-1 font-medium text-slate-950">
                          {formatDateTime(shopPackage.delivered_at || shopPackage.shipped_at || shopPackage.updated_at || shopPackage.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              <div className="mb-2 flex items-center gap-2 font-medium text-slate-700">
                <PackageSearch className="size-4" />
                Chưa có thông tin vận chuyển
              </div>
              {order.payment ? (
                <p>Đơn hàng đang chờ thanh toán. Sau khi thanh toán thành công, người bán sẽ chuẩn bị và gửi hàng.</p>
              ) : (
                <p>Đơn hàng COD. Người bán sẽ chuẩn bị và gửi hàng ngay.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
