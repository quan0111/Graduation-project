import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CouponFormProps {
  isAdmin?: boolean;
  shopId?: number;
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  isAdmin = false,
  shopId,
  onCancel,
  onSubmit,
}) => {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [targetType, setTargetType] = useState<"ALL" | "CATEGORY" | "PRODUCT">("ALL");
  const [targetId, setTargetId] = useState("");

  const handleSubmit = () => {
    if (!code.trim()) {
      alert("Vui lòng nhập mã coupon");
      return;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      alert("Vui lòng nhập giá trị giảm giá hợp lệ");
      return;
    }

    const data: any = {
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
    };

    if (minOrderAmount) data.minOrderAmount = Number(minOrderAmount);
    if (maxDiscount) data.maxDiscount = Number(maxDiscount);
    if (usageLimit) data.usageLimit = Number(usageLimit);
    if (validFrom) data.validFrom = validFrom;
    if (validUntil) data.validUntil = validUntil;

    if (isAdmin) {
      if (targetType === "CATEGORY" && targetId) {
        data.applicableCategoryId = Number(targetId);
      }
    } else {
      if (shopId) data.applicableShopId = shopId;
      if (targetType === "PRODUCT" && targetId) {
        data.applicableProductId = Number(targetId);
      }
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {isAdmin ? "Tạo Coupon (Admin)" : "Tạo Coupon (Seller)"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="size-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Mã coupon *</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: SUMMER2024"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Mô tả</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về khuyến mãi..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Loại giảm giá *</Label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="PERCENTAGE">Phần trăm (%)</option>
              <option value="FIXED">Cố định (₫)</option>
            </select>
          </div>

          <div>
            <Label>Giá trị giảm giá *</Label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "PERCENTAGE" ? "VD: 10" : "VD: 50000"}
              className="mt-1"
            />
          </div>

          {discountType === "PERCENTAGE" && (
            <div>
              <Label>Giảm giá tối đa (₫)</Label>
              <Input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="VD: 100000"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label>Số tiền tối thiểu đơn hàng (₫)</Label>
            <Input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="VD: 100000"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Giới hạn số lần sử dụng</Label>
            <Input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Để trống nếu không giới hạn"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ngày bắt đầu</Label>
              <Input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {isAdmin && (
            <div>
              <Label>Phạm vi áp dụng</Label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="ALL">Tất cả ngành hàng</option>
                <option value="CATEGORY">Theo ngành hàng</option>
              </select>
              {targetType === "CATEGORY" && (
                <Input
                  type="number"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="ID ngành hàng"
                  className="mt-2"
                />
              )}
            </div>
          )}

          {!isAdmin && (
            <div>
              <Label>Phạm vi áp dụng</Label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="ALL">Tất cả sản phẩm shop</option>
                <option value="PRODUCT">Theo sản phẩm</option>
              </select>
              {targetType === "PRODUCT" && (
                <Input
                  type="number"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="ID sản phẩm"
                  className="mt-2"
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={onCancel} variant="outline">
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#ee4d2d] hover:bg-[#d93f21]">
              Tạo Coupon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
