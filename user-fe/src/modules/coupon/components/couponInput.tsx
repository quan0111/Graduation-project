import { Check, Ticket, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCalculateDiscount, useValidateCoupon } from "../api/get-coupon";

interface CouponInputProps {
  orderAmount: number;
  shopIds?: number[];
  onApplyCoupon: (coupon: any, discount: number) => void;
  onRemoveCoupon: () => void;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  orderAmount,
  shopIds = [],
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [code, setCode] = useState("");
  const [debouncedCode, setDebouncedCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(code);
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  const {
    data: coupon,
    isLoading: validating,
    isError: isCouponInvalid,
    error: couponError,
  } = useValidateCoupon(debouncedCode, orderAmount, shopIds, {
    enabled: debouncedCode.length > 0,
    retry: false,
  });

  const { data: discountData, isLoading: calculatingDiscount } = useCalculateDiscount(
    coupon?.id ?? 0,
    orderAmount,
    shopIds,
    { enabled: !!coupon?.id },
  );

  const handleApply = () => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    if (!coupon || isCouponInvalid) {
      toast.error((couponError as any)?.response?.data?.detail || "Voucher không hợp lệ cho đơn hàng này");
      return;
    }

    setAppliedCoupon(coupon);
    const discount = Math.max(0, discountData?.discountAmount ?? coupon.discountAmount ?? 0);
    onApplyCoupon(coupon, discount);
    toast.success(`Đã áp dụng voucher ${code}`);
  };

  const handleRemove = () => {
    setCode("");
    setAppliedCoupon(null);
    onRemoveCoupon();
    toast.info("Đã xóa voucher");
  };

  return (
    <div className="space-y-3">
      {appliedCoupon ? (
        <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
          <div className="flex items-center gap-2">
            <Check className="size-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">{appliedCoupon.code}</p>
              <p className="text-xs text-green-700">
                {appliedCoupon.discountType === "PERCENTAGE"
                  ? `Giảm ${appliedCoupon.discountValue}%`
                  : `Giảm ${Number(appliedCoupon.discountValue).toLocaleString("vi-VN")}đ`}
              </p>
            </div>
          </div>
          <button onClick={handleRemove} className="text-green-600 hover:text-green-800" type="button">
            <X className="size-4" />
          </button>
        </div>
      ) : (
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
            onClick={handleApply}
            variant="outline"
            disabled={validating || calculatingDiscount}
            className="whitespace-nowrap"
          >
            {validating || calculatingDiscount ? "Đang kiểm tra..." : "Áp dụng"}
          </Button>
        </div>
      )}
    </div>
  );
};
