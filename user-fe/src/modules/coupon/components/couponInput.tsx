import { Check, Ticket, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { usePreviewCouponStack, type AppliedCouponPreview, type CouponStackItem } from "../api/get-coupon";

interface CouponInputProps {
  orderAmount: number;
  shippingFee?: number;
  shopIds?: number[];
  items?: CouponStackItem[];
  onApplyCoupon: (coupons: AppliedCouponPreview[], discount: number) => void;
  onRemoveCoupon: () => void;
}

const SCOPE_LABEL: Record<string, string> = {
  ORDER: "Voucher hệ thống",
  SHIPPING: "Voucher vận chuyển",
  SHOP: "Voucher shop",
  CATEGORY: "Voucher ngành hàng",
  PRODUCT: "Voucher sản phẩm",
};

const formatDiscount = (coupon: AppliedCouponPreview) =>
  coupon.discountType === "PERCENTAGE"
    ? `Giảm ${coupon.discountValue}%`
    : `Giảm ${Number(coupon.discountValue).toLocaleString("vi-VN")}đ`;

export const CouponInput: React.FC<CouponInputProps> = ({
  orderAmount,
  shippingFee = 0,
  shopIds = [],
  items = [],
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [code, setCode] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCouponPreview[]>([]);
  const previewMutation = usePreviewCouponStack();

  const previewStack = async (codes: string[]) => {
    return previewMutation.mutateAsync({
      couponCodes: codes,
      orderAmount,
      shippingFee,
      shopIds,
      items,
    });
  };

  const handleApply = async () => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    if (appliedCoupons.some((coupon) => coupon.code === normalizedCode)) {
      toast.error("Voucher này đã được áp dụng");
      return;
    }

    try {
      const nextCodes = [...appliedCoupons.map((coupon) => coupon.code), normalizedCode];
      const preview = await previewStack(nextCodes);
      setAppliedCoupons(preview.appliedCoupons);
      onApplyCoupon(preview.appliedCoupons, Math.max(0, preview.discountAmount));
      setCode("");
      toast.success(`Đã áp dụng voucher ${normalizedCode}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Voucher không hợp lệ cho đơn hàng này");
    }
  };

  const handleRemove = async (couponCode: string) => {
    const nextCodes = appliedCoupons.map((coupon) => coupon.code).filter((item) => item !== couponCode);

    if (!nextCodes.length) {
      setAppliedCoupons([]);
      onRemoveCoupon();
      toast.info("Đã xóa voucher");
      return;
    }

    try {
      const preview = await previewStack(nextCodes);
      setAppliedCoupons(preview.appliedCoupons);
      onApplyCoupon(preview.appliedCoupons, Math.max(0, preview.discountAmount));
      toast.info("Đã xóa voucher");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể cập nhật voucher");
    }
  };

  return (
    <div className="space-y-3">
      {appliedCoupons.length > 0 ? (
        <div className="space-y-2">
          {appliedCoupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between rounded-lg bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <Check className="size-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{coupon.code}</p>
                  <p className="text-xs text-green-700">
                    {SCOPE_LABEL[coupon.scope] || "Voucher"} · {formatDiscount(coupon)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => void handleRemove(coupon.code)}
                className="text-green-600 hover:text-green-800"
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Nhập mã voucher"
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => void handleApply()}
          variant="outline"
          disabled={previewMutation.isPending}
          className="whitespace-nowrap"
        >
          {previewMutation.isPending ? "Đang kiểm tra..." : "Áp dụng"}
        </Button>
      </div>
    </div>
  );
};
