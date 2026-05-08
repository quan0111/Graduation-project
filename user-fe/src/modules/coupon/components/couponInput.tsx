import { useState, useEffect } from "react";
import { Ticket, X, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCouponByCode, useValidateCoupon } from "../api/get-coupon";

interface CouponInputProps {
  orderAmount: number;
  onApplyCoupon: (coupon: any, discount: number) => void;
  onRemoveCoupon: () => void;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  orderAmount,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [code, setCode] = useState("");
  const [debouncedCode, setDebouncedCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Debounce code input - chỉ gọi API sau 500ms khi người dùng dừng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(code);
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  // Chỉ gọi API khi debouncedCode có giá trị
  const { data: coupon, isLoading: validating } = useCouponByCode(debouncedCode, {
    enabled: debouncedCode.length > 0,
  });

  const { data: validation } = useValidateCoupon(debouncedCode, orderAmount, {
    enabled: debouncedCode.length > 0,
  });

  const handleApply = () => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    if (!coupon) {
      toast.error("Không tìm thấy voucher này");
      return;
    }

    if (!validation?.valid) {
      toast.error(validation?.message || "Voucher không hợp lệ cho đơn hàng này");
      return;
    }

    setAppliedCoupon(coupon);
    const discount = validation?.discountAmount || 0;
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
                  : `Giảm ${appliedCoupon.discountValue}₫`}
              </p>
            </div>
          </div>
          <button onClick={handleRemove} className="text-green-600 hover:text-green-800">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã voucher"
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleApply}
            variant="outline"
            disabled={validating}
            className="whitespace-nowrap"
          >
            {validating ? "Đang kiểm tra..." : "Áp dụng"}
          </Button>
        </div>
      )}
    </div>
  );
};
