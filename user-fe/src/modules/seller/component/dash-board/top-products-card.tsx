import { PackageCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateProduct } from "@/modules/product/api/update-product";
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
  const updateStockMutation = useUpdateVariantStock();

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

    try {
      await updateStockMutation.mutateAsync({ variantId: product.variantId, quantity });
      toast.success(`Da tang kho +${quantity} cho ${product.name}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khong the cap nhat ton kho");
    }
  };

  const handleEditPrice = async (product: SellerDashboardTopProduct) => {
    const rawValue = window.prompt("Nhap gia moi (VND)", String(product.price || 1000));
    if (!rawValue) {
      return;
    }
    const nextPrice = Number(rawValue);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      toast.error("Gia khong hop le");
      return;
    }

    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: { price: nextPrice },
      });
      toast.success("Da cap nhat gia san pham");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khong the cap nhat gia");
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
                      <Button size="sm" variant="outline" onClick={() => handleIncreaseStock(product, 10)}>
                        +10 kho
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditPrice(product)}>
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
    </Card>
  );
}

export function SellerDashboardInventoryCard({ inventory }: SellerDashboardInventoryCardProps) {
  const updateStockMutation = useUpdateVariantStock();

  const handleIncreaseStock = async (item: SellerDashboardInventoryItem) => {
    if (!item.variantId) {
      toast.error("San pham nay chua co bien the de cap nhat kho");
      return;
    }

    try {
      await updateStockMutation.mutateAsync({ variantId: item.variantId, quantity: 10 });
      toast.success(`Da tang kho +10 cho ${item.name}`);
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
            <Button className="mt-3 w-full" size="sm" variant="outline" onClick={() => handleIncreaseStock(item)}>
              Tang kho +10
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
