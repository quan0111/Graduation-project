import { useState } from "react";
import { PackageCheck, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdateProduct } from "@/modules/product/api/update-product";
import { useUpdateVariant } from "@/modules/product/api/update-variant";
import { useUpdateVariantStock } from "@/modules/product/api/update-variant-stock";
import { cn } from "@/lib/utils";

import type { SellerDashboardInventoryItem, SellerDashboardTopProduct } from "../../types/dashboard";
import { formatCurrency, formatShortDateTime, getProductStatusLabel, getProductStatusTone } from "../../utils/dashboard";

interface SellerDashboardTopProductsCardProps {
  products: SellerDashboardTopProduct[];
}

interface SellerDashboardInventoryCardProps {
  inventory: SellerDashboardInventoryItem[];
}

export function SellerDashboardTopProductsCard({ products }: SellerDashboardTopProductsCardProps) {
  const updateProductMutation = useUpdateProduct();
  const updateVariantMutation = useUpdateVariant();
  const updateStockMutation = useUpdateVariantStock();
  const [stockTarget, setStockTarget] = useState<SellerDashboardTopProduct | null>(null);
  const [stockQuantity, setStockQuantity] = useState("10");
  const [priceTarget, setPriceTarget] = useState<SellerDashboardTopProduct | null>(null);
  const [nextPrice, setNextPrice] = useState("");

  const handleToggleStatus = async (product: SellerDashboardTopProduct) => {
    try {
      const nextStatus = product.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: { status: nextStatus },
      });
      toast.success(nextStatus === "ACTIVE" ? "Da mo ban san pham" : "Da tam an san pham");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khong the cap nhat trang thai san pham");
    }
  };

  const handleIncreaseStock = async (product: SellerDashboardTopProduct, quantity: number) => {
    if (!product.variantId) {
      toast.error("San pham nay chua co bien the de cap nhat kho");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("So luong tang kho khong hop le");
      return;
    }

    try {
      await updateStockMutation.mutateAsync({
        variantId: product.variantId,
        quantity,
        reason: `Seller tăng kho từ dashboard: ${product.name}`,
      });
      toast.success(`Da tang kho +${quantity} cho ${product.name}`);
      setStockTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khong the cap nhat ton kho");
    }
  };

  const handleEditPrice = async (product: SellerDashboardTopProduct, value: number) => {
    if (!product.variantId) {
      toast.error("Sản phẩm này chưa có biến thể để sửa giá");
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Giá không hợp lệ");
      return;
    }

    try {
      await updateVariantMutation.mutateAsync({
        variantId: product.variantId,
        data: { price: value },
      });
      toast.success("Đã cập nhật giá variant");
      setPriceTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể cập nhật giá variant");
    }
  };

  return (
    <Card id="products" className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-slate-950">San pham ban chay</CardTitle>
          <p className="text-sm text-slate-500">Xep hang theo doanh thu tu du lieu don hang</p>
        </div>
        <Button variant="ghost" size="sm" className="text-[#ee4d2d]">
          Xem tat ca
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">San pham</th>
                <th className="px-4 py-3 font-semibold">Da ban</th>
                <th className="px-4 py-3 font-semibold">Ton kho</th>
                <th className="px-4 py-3 font-semibold">Doanh thu</th>
                <th className="px-4 py-3 font-semibold">Trang thai</th>
                <th className="px-4 py-3 font-semibold">Thao tac</th>
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
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setStockTarget(product);
                          setStockQuantity("10");
                        }}
                      >
                        Tang kho
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPriceTarget(product);
                          setNextPrice(String(product.price || ""));
                        }}
                      >
                        Sua gia
                      </Button>
                      <Button size="sm" onClick={() => handleToggleStatus(product)}>
                        {product.status === "ACTIVE" ? "Tam an" : "Mo ban"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {stockTarget && (
        <NumberInputModal
          title="Tang ton kho"
          description={`Nhap so luong muon cong them cho ${stockTarget.name}.`}
          label="So luong tang them"
          value={stockQuantity}
          onChange={setStockQuantity}
          confirmLabel="Cap nhat kho"
          isPending={updateStockMutation.isPending}
          onCancel={() => setStockTarget(null)}
          onConfirm={() => handleIncreaseStock(stockTarget, Number(stockQuantity))}
        />
      )}

      {priceTarget && (
        <NumberInputModal
          title="Sua gia san pham"
          description={`Nhập giá mới cho variant ${priceTarget.name}.`}
          label="Giá mới (VND)"
          value={nextPrice}
          onChange={setNextPrice}
          confirmLabel="Lưu giá"
          isPending={updateVariantMutation.isPending}
          onCancel={() => setPriceTarget(null)}
          onConfirm={() => handleEditPrice(priceTarget, Number(nextPrice))}
        />
      )}
    </Card>
  );
}

export function SellerDashboardInventoryCard({ inventory }: SellerDashboardInventoryCardProps) {
  const updateStockMutation = useUpdateVariantStock();
  const [stockTarget, setStockTarget] = useState<SellerDashboardInventoryItem | null>(null);
  const [stockQuantity, setStockQuantity] = useState("10");

  const handleIncreaseStock = async (item: SellerDashboardInventoryItem, quantity: number) => {
    if (!item.variantId) {
      toast.error("San pham nay chua co bien the de cap nhat kho");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("So luong tang kho khong hop le");
      return;
    }

    try {
      await updateStockMutation.mutateAsync({
        variantId: item.variantId,
        quantity,
        reason: `Seller tăng kho từ dashboard: ${item.name}`,
      });
      toast.success(`Da tang kho +${quantity} cho ${item.name}`);
      setStockTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khong the cap nhat ton kho");
    }
  };

  return (
    <Card id="shipping" className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-950">Ton kho can chu y</CardTitle>
        <p className="text-sm text-slate-500">Sap xep theo so luong ton thap nhat</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {inventory.map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">Cap nhat {formatShortDateTime(item.updatedAt)}</p>
              </div>
              <Badge className={cn("bg-transparent", getProductStatusTone(item.status, item.stock))}>
                {getProductStatusLabel(item.status, item.stock)}
              </Badge>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-500">Ton kho: {item.stock}</span>
              <span className="font-semibold text-slate-900">{formatCurrency(item.price)}</span>
            </div>
            <Button
              className="mt-3 w-full"
              size="sm"
              variant="outline"
              onClick={() => {
                setStockTarget(item);
                setStockQuantity("10");
              }}
            >
              Tang kho
            </Button>
          </div>
        ))}
      </CardContent>

      {stockTarget && (
        <NumberInputModal
          title="Tang ton kho"
          description={`Nhap so luong muon cong them cho ${stockTarget.name}.`}
          label="So luong tang them"
          value={stockQuantity}
          onChange={setStockQuantity}
          confirmLabel="Cap nhat kho"
          isPending={updateStockMutation.isPending}
          onCancel={() => setStockTarget(null)}
          onConfirm={() => handleIncreaseStock(stockTarget, Number(stockQuantity))}
        />
      )}
    </Card>
  );
}

function NumberInputModal({
  title,
  description,
  label,
  value,
  onChange,
  confirmLabel,
  isPending,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  confirmLabel: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="size-5" />
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
        <Input
          type="number"
          min="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Nhap so"
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Huy
          </Button>
          <Button onClick={onConfirm} disabled={isPending} className="bg-[#ee4d2d] hover:bg-[#d93f21]">
            {isPending ? "Dang luu..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
