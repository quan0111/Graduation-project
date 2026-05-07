import { useState } from "react";
import { Search, AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useSellerProducts } from "@/modules/seller/api/get-seller-products";
import { useUpdateStock } from "@/modules/seller/api/update-stock";

export default function SellerInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stockUpdates, setStockUpdates] = useState<Record<number, string>>({});
  
  const { data: products = [], isLoading, refetch } = useSellerProducts();
  const updateStockMutation = useUpdateStock();

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = filteredProducts.filter((p: any) => p.stock < 10);
  const outOfStockProducts = filteredProducts.filter((p: any) => p.stock === 0);
  const totalStock = filteredProducts.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);

  const handleStockUpdate = async (productId: number, newStock: number) => {
    if (newStock < 0) {
      toast.error("Số lượng không thể âm");
      return;
    }

    try {
      await updateStockMutation.mutateAsync({ productId, stock: newStock });
      toast.success("Cập nhật kho thành công");
      setStockUpdates((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      refetch();
    } catch (error) {
      toast.error("Không thể cập nhật kho");
    }
  };

  return (
    <SellerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý kho hàng</h1>
            <p className="text-sm text-slate-500 mt-1">Theo dõi và quản lý tồn kho sản phẩm</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-slate-900">{filteredProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng tồn kho</p>
                <p className="text-2xl font-bold text-slate-900">{totalStock}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-slate-900">{lowStockProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-2xl">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Hết hàng</p>
                <p className="text-2xl font-bold text-slate-900">{outOfStockProducts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Inventory List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Đang tải dữ liệu kho...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Không có sản phẩm nào</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Sản phẩm</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">SKU</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Tồn kho</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Đã bán</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Trạng thái</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: any) => {
                    const isLowStock = product.stock > 0 && product.stock < 10;
                    const isOutOfStock = product.stock === 0;
                    const currentUpdate = stockUpdates[product.id] ?? product.stock;

                    return (
                      <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.images && product.images[0] && (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-sm text-slate-500">{product.category?.name || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{product.sku || "N/A"}</td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            value={currentUpdate}
                            onChange={(e) => setStockUpdates((prev) => ({
                              ...prev,
                              [product.id]: e.target.value,
                            }))}
                            className="w-24"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4 text-slate-900">{product.sold_count || 0}</td>
                        <td className="px-6 py-4">
                          {isOutOfStock && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                              Hết hàng
                            </span>
                          )}
                          {isLowStock && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                              Sắp hết
                            </span>
                          )}
                          {!isOutOfStock && !isLowStock && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                              Đủ hàng
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleStockUpdate(product.id, parseInt(currentUpdate) || 0)}
                            disabled={
                              updateStockMutation.isPending ||
                              currentUpdate === product.stock?.toString()
                            }
                          >
                            Lưu
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SellerDashboardLayout>
  );
}
