import { useState } from "react";
import { Plus, Search, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { useGetCoupon } from "@/modules/coupon/api/get-coupon";
import { useCreateCoupon } from "@/modules/coupon/api/create-coupon";
import { useActivateCoupon, useDeactivateCoupon } from "@/modules/coupon/api/update-coupon";
import { CouponForm } from "@/modules/coupon/components/couponForm";
import { useGetShopByOwnerId } from "@/modules/shop/api/myshop";
import { useSellerProducts } from "@/modules/seller/api/get-seller-products";

const normalizeCoupons = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const getCouponScopeLabel = (coupon: any) => {
  const productTargets = Array.isArray(coupon.productTargets) ? coupon.productTargets : [];
  const productIds = Array.isArray(coupon.applicableProductIds) ? coupon.applicableProductIds : [];
  const selectedCount = productTargets.length || productIds.length || (coupon.applicableProductId ? 1 : 0);

  return selectedCount > 0 ? `${selectedCount} sản phẩm` : "Tất cả shop";
};

export default function SellerCouponsPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: couponsData, isLoading, refetch } = useGetCoupon();
  const { data: myShop, isLoading: isShopLoading } = useGetShopByOwnerId();
  const { data: products = [] } = useSellerProducts();
  const createMutation = useCreateCoupon();
  const activateMutation = useActivateCoupon();
  const deactivateMutation = useDeactivateCoupon();

  const coupons = normalizeCoupons(couponsData);
  const shopId = myShop?.id;

  const filteredCoupons = coupons.filter(
    (coupon: any) =>
      coupon.applicableShopId === shopId &&
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCoupon = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Đã tạo coupon thành công");
      setShowForm(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể tạo coupon");
    }
  };

  const handleToggleActive = async (couponId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateMutation.mutateAsync(couponId);
        toast.success("Đã vô hiệu hóa coupon");
      } else {
        await activateMutation.mutateAsync(couponId);
        toast.success("Đã kích hoạt coupon");
      }
      refetch();
    } catch (error: any) {
      toast.error("Không thể thay đổi trạng thái coupon");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Coupon Shop</h1>
            <p className="text-sm text-slate-500">Tạo và quản lý mã khuyến mãi cho shop của bạn</p>
          </div>
          <Button onClick={() => setShowForm(true)} disabled={!shopId} className="bg-[#ee4d2d] hover:bg-[#d93f21]">
            <Plus className="mr-2 size-4" />
            Tạo Coupon Mới
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo mã coupon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading || isShopLoading ? (
              <div className="text-center py-8 text-slate-500">Đang tải...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Mã</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Mô tả</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Loại</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Giảm giá</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Phạm vi</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Sử dụng</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Thời hạn</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                          Chưa có coupon nào
                        </td>
                      </tr>
                    ) : (
                      filteredCoupons.map((coupon: any) => (
                        <tr key={coupon.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-900">{coupon.code}</td>
                          <td className="px-4 py-3 text-slate-600">{coupon.description || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {coupon.discountType === "PERCENTAGE" ? "%" : "Cố định"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {coupon.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}%`
                              : `${coupon.discountValue}₫`}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {getCouponScopeLabel(coupon)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {coupon.usedCount}/{coupon.usageLimit || "∞"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {coupon.validUntil
                              ? new Date(coupon.validUntil).toLocaleDateString("vi-VN")
                              : "Không giới hạn"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                coupon.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {coupon.isActive ? "Hoạt động" : "Vô hiệu"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                            >
                              {coupon.isActive ? (
                                <PowerOff className="size-4 text-slate-600" />
                              ) : (
                                <Power className="size-4 text-green-600" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <CouponForm
          isAdmin={false}
          shopId={shopId ?? 0}
          products={products}
          onCancel={() => setShowForm(false)}
          onSubmit={handleCreateCoupon}
        />
      )}
    </div>
  );
}
