import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CouponTargetType = "ALL" | "SHIPPING" | "CATEGORY" | "PRODUCT";

type CouponSelectableProduct = {
  id: number;
  name: string;
  price: number;
  status: string;
  totalStock?: number;
  category?: { id: number; name: string };
  images?: Array<{ url: string; isPrimary?: boolean }>;
  variants?: Array<{ stock: number; images?: Array<{ url: string }> }>;
};

interface CouponFormProps {
  isAdmin?: boolean;
  shopId?: number;
  products?: CouponSelectableProduct[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getProductStock = (product: CouponSelectableProduct) =>
  product.totalStock ?? product.variants?.reduce((sum, variant) => sum + Number(variant.stock || 0), 0) ?? 0;

const getProductImage = (product: CouponSelectableProduct) =>
  product.images?.find((image) => image.isPrimary)?.url ||
  product.images?.[0]?.url ||
  product.variants?.[0]?.images?.[0]?.url;

export const CouponForm: React.FC<CouponFormProps> = ({
  isAdmin = false,
  shopId,
  products = [],
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
  const [targetType, setTargetType] = useState<CouponTargetType>("ALL");
  const [targetId, setTargetId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();
    if (!keyword) {
      return products;
    }
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.category?.name?.toLowerCase().includes(keyword) ||
        String(product.id).includes(keyword)
      );
    });
  }, [productSearch, products]);

  const selectedProductSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds]);

  const toggleProduct = (productId: number) => {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const toggleAllFilteredProducts = () => {
    const filteredIds = filteredProducts.map((product) => product.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedProductSet.has(id));

    setSelectedProductIds((current) => {
      if (allSelected) {
        return current.filter((id) => !filteredIds.includes(id));
      }
      return Array.from(new Set([...current, ...filteredIds]));
    });
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      alert("Vui lòng nhập mã coupon");
      return;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      alert("Vui lòng nhập giá trị giảm giá hợp lệ");
      return;
    }

    if (!isAdmin && targetType === "PRODUCT" && selectedProductIds.length === 0) {
      alert("Chọn ít nhất một sản phẩm áp dụng coupon");
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
      data.scope = targetType === "SHIPPING" ? "SHIPPING" : targetType === "CATEGORY" ? "CATEGORY" : "ORDER";
      if (targetType === "CATEGORY" && targetId) {
        data.applicableCategoryId = Number(targetId);
      }
    } else {
      if (shopId) data.applicableShopId = shopId;
      if (targetType === "PRODUCT") {
        data.scope = "PRODUCT";
        data.applicableProductIds = selectedProductIds;
      } else {
        data.scope = "SHOP";
      }
    }

    onSubmit(data);
  };

  const allFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every((product) => selectedProductSet.has(product.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {isAdmin ? "Tạo coupon hệ thống" : "Tạo coupon shop"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600" type="button">
            <X className="size-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Mã coupon *</Label>
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="VD: SUMMER2026"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Mô tả</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả về khuyến mãi..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Loại giảm giá *</Label>
              <select
                value={discountType}
                onChange={(event) => setDiscountType(event.target.value as "PERCENTAGE" | "FIXED")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Cố định (đ)</option>
              </select>
            </div>
            <div>
              <Label>Giá trị giảm giá *</Label>
              <Input
                type="number"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                placeholder={discountType === "PERCENTAGE" ? "VD: 10" : "VD: 50000"}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {discountType === "PERCENTAGE" ? (
              <div>
                <Label>Giảm tối đa (đ)</Label>
                <Input
                  type="number"
                  value={maxDiscount}
                  onChange={(event) => setMaxDiscount(event.target.value)}
                  placeholder="VD: 100000"
                  className="mt-1"
                />
              </div>
            ) : null}
            <div>
              <Label>Đơn tối thiểu (đ)</Label>
              <Input
                type="number"
                value={minOrderAmount}
                onChange={(event) => setMinOrderAmount(event.target.value)}
                placeholder="VD: 100000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Giới hạn lượt dùng</Label>
              <Input
                type="number"
                value={usageLimit}
                onChange={(event) => setUsageLimit(event.target.value)}
                placeholder="Để trống nếu không giới hạn"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ngày bắt đầu</Label>
              <Input
                type="date"
                value={validFrom}
                onChange={(event) => setValidFrom(event.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {isAdmin ? (
            <div>
              <Label>Phạm vi áp dụng</Label>
              <select
                value={targetType}
                onChange={(event) => setTargetType(event.target.value as CouponTargetType)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="ALL">Toàn hệ thống</option>
                <option value="SHIPPING">Voucher vận chuyển</option>
                <option value="CATEGORY">Theo ngành hàng</option>
              </select>
              {targetType === "CATEGORY" && (
                <Input
                  type="number"
                  value={targetId}
                  onChange={(event) => setTargetId(event.target.value)}
                  placeholder="ID ngành hàng"
                  className="mt-2"
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Phạm vi áp dụng</Label>
                <select
                  value={targetType}
                  onChange={(event) => {
                    setTargetType(event.target.value as CouponTargetType);
                    setSelectedProductIds([]);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="ALL">Tất cả sản phẩm shop</option>
                  <option value="PRODUCT">Chọn nhiều sản phẩm</option>
                </select>
              </div>

              {targetType === "PRODUCT" ? (
                <div className="rounded-2xl border border-slate-200">
                  <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Sản phẩm áp dụng ({selectedProductIds.length})
                      </p>
                      <p className="text-xs text-slate-500">Có thể chọn nhiều sản phẩm cho cùng một coupon.</p>
                    </div>
                    <Input
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Tìm tên, ID, ngành hàng..."
                      className="sm:w-64"
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="w-12 px-3 py-3 text-left">
                            <Checkbox checked={allFilteredSelected} onCheckedChange={toggleAllFilteredProducts} />
                          </th>
                          <th className="px-3 py-3 text-left font-semibold text-slate-700">Sản phẩm</th>
                          <th className="px-3 py-3 text-left font-semibold text-slate-700">Giá</th>
                          <th className="px-3 py-3 text-left font-semibold text-slate-700">Kho</th>
                          <th className="px-3 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => {
                          const imageUrl = getProductImage(product);
                          return (
                            <tr key={product.id} className="border-b border-slate-100">
                              <td className="px-3 py-3">
                                <Checkbox
                                  checked={selectedProductSet.has(product.id)}
                                  onCheckedChange={() => toggleProduct(product.id)}
                                />
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-3">
                                  {imageUrl ? (
                                    <img src={imageUrl} alt={product.name} className="size-10 rounded-lg object-cover" />
                                  ) : (
                                    <div className="size-10 rounded-lg bg-slate-100" />
                                  )}
                                  <div>
                                    <p className="line-clamp-1 font-medium text-slate-900">{product.name}</p>
                                    <p className="text-xs text-slate-500">ID #{product.id} · {product.category?.name || "Chưa có ngành"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-slate-700">{formatCurrency(product.price)}</td>
                              <td className="px-3 py-3 text-slate-700">{getProductStock(product)}</td>
                              <td className="px-3 py-3 text-slate-700">{product.status}</td>
                            </tr>
                          );
                        })}
                        {!filteredProducts.length ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">
                              Không có sản phẩm phù hợp.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={onCancel} variant="outline">
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#ee4d2d] hover:bg-[#d93f21]">
              Tạo coupon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
