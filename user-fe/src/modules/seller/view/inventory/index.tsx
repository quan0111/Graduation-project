import { useMemo, useState } from "react";
import { AlertTriangle, Package, Search, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateVariant } from "@/modules/product/api/update-variant";
import { useUpdateVariantStock } from "@/modules/product/api/update-variant-stock";
import { type SellerProduct, useSellerProducts } from "@/modules/seller/api/get-seller-products";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";

type InventoryVariantRow = {
  productId: number;
  productName: string;
  productStatus: string;
  categoryName?: string;
  imageUrl?: string;
  variantId: number;
  variantName: string;
  sku?: string | null;
  price: number;
  stock: number;
};
type SellerVariant = NonNullable<SellerProduct["variants"]>[number];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getProductImage = (product: SellerProduct, variant?: SellerVariant) =>
  variant?.images?.[0]?.url ||
  product.images?.find((image) => image.isPrimary)?.url ||
  product.images?.[0]?.url;

const flattenProductVariants = (products: SellerProduct[]): InventoryVariantRow[] =>
  products.flatMap((product) => {
    const variants = product.variants ?? [];
    if (!variants.length) {
      return [];
    }

    return variants.map((variant) => ({
      productId: product.id,
      productName: product.name,
      productStatus: product.status,
      categoryName: product.category?.name,
      imageUrl: getProductImage(product, variant),
      variantId: variant.id,
      variantName: variant.name,
      sku: variant.sku,
      price: Number(variant.price || 0),
      stock: Number(variant.stock || 0),
    }));
  });

export default function SellerInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stockIncrements, setStockIncrements] = useState<Record<number, string>>({});
  const [priceUpdates, setPriceUpdates] = useState<Record<number, string>>({});

  const { data: products = [], isLoading, refetch } = useSellerProducts();
  const updateStockMutation = useUpdateVariantStock();
  const updateVariantMutation = useUpdateVariant();

  const variantRows = useMemo(() => flattenProductVariants(products), [products]);
  const filteredRows = useMemo(
    () =>
      variantRows.filter((row) => {
        const value = searchQuery.trim().toLowerCase();
        if (!value) return true;
        return (
          row.productName.toLowerCase().includes(value) ||
          row.variantName.toLowerCase().includes(value) ||
          (row.sku || "").toLowerCase().includes(value) ||
          (row.categoryName || "").toLowerCase().includes(value)
        );
      }),
    [searchQuery, variantRows],
  );

  const lowStockRows = filteredRows.filter((row) => row.stock > 0 && row.stock < 10);
  const outOfStockRows = filteredRows.filter((row) => row.stock === 0);
  const totalStock = filteredRows.reduce((sum, row) => sum + row.stock, 0);

  const handleIncreaseStock = async (row: InventoryVariantRow) => {
    const quantity = Number(stockIncrements[row.variantId] || 0);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Số lượng tăng kho phải là số nguyên lớn hơn 0");
      return;
    }

    try {
      await updateStockMutation.mutateAsync({
        variantId: row.variantId,
        quantity,
        reason: `Seller tăng kho ${row.productName} - ${row.variantName}`,
      });
      toast.success(`Đã tăng kho +${quantity} cho ${row.variantName}`);
      setStockIncrements((current) => {
        const next = { ...current };
        delete next[row.variantId];
        return next;
      });
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể tăng kho variant");
    }
  };

  const handleUpdatePrice = async (row: InventoryVariantRow) => {
    const price = Number(priceUpdates[row.variantId] ?? row.price);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Giá variant phải lớn hơn 0");
      return;
    }

    try {
      await updateVariantMutation.mutateAsync({
        variantId: row.variantId,
        data: { price },
      });
      toast.success(`Đã cập nhật giá ${row.variantName}`);
      setPriceUpdates((current) => {
        const next = { ...current };
        delete next[row.variantId];
        return next;
      });
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể cập nhật giá variant");
    }
  };

  return (
    <SellerDashboardLayout>
      <div className="mx-auto max-w-[1480px] min-w-0 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý kho và giá theo phân loại</h1>
            <p className="mt-1 text-sm text-slate-500">
              Chọn đúng variant để tăng tồn kho hoặc sửa giá, không cập nhật gộp ở cấp sản phẩm.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng variant</p>
                <p className="text-2xl font-bold text-slate-900">{filteredRows.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng tồn kho</p>
                <p className="text-2xl font-bold text-slate-900">{totalStock}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-slate-900">{lowStockRows.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-red-100 p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Hết hàng</p>
                <p className="text-2xl font-bold text-slate-900">{outOfStockRows.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo sản phẩm, phân loại, SKU hoặc danh mục..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Đang tải dữ liệu kho...</div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">
            Không có variant phù hợp
          </div>
        ) : (
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1320px] table-fixed">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="w-[360px] px-5 py-3.5 text-left text-sm font-semibold text-slate-700">Sản phẩm / Variant</th>
                    <th className="w-[250px] px-4 py-3.5 text-left text-sm font-semibold text-slate-700">SKU</th>
                    <th className="w-[110px] px-4 py-3.5 text-center text-sm font-semibold text-slate-700">Tồn kho</th>
                    <th className="w-[210px] px-4 py-3.5 text-left text-sm font-semibold text-slate-700">Nhập thêm</th>
                    <th className="w-[280px] px-4 py-3.5 text-left text-sm font-semibold text-slate-700">Giá bán</th>
                    <th className="w-[110px] px-4 py-3.5 text-center text-sm font-semibold text-slate-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const isLowStock = row.stock > 0 && row.stock < 10;
                    const isOutOfStock = row.stock === 0;
                    const priceValue = priceUpdates[row.variantId] ?? String(row.price);
                    const stockValue = stockIncrements[row.variantId] ?? "";

                    return (
                      <tr key={row.variantId} className="border-b border-slate-100 align-middle transition hover:bg-slate-50/80">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {row.imageUrl ? (
                              <img
                                src={row.imageUrl}
                                alt={row.productName}
                                className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-slate-100"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold leading-5 text-slate-900">{row.productName}</p>
                              <p className="mt-1 truncate text-sm text-slate-500">{row.variantName}</p>
                              <p className="truncate text-xs text-slate-400">{row.categoryName || "Chưa có danh mục"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">
                          <span
                            title={row.sku || "N/A"}
                            className="block max-w-full truncate rounded-lg bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-600 ring-1 ring-slate-100"
                          >
                            {row.sku || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex min-w-14 justify-center rounded-lg bg-slate-50 px-3 py-2 text-base font-semibold text-slate-900 ring-1 ring-slate-100">
                            {row.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="grid max-w-[180px] grid-cols-[88px_76px] items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={stockValue}
                              onChange={(event) =>
                                setStockIncrements((current) => ({
                                  ...current,
                                  [row.variantId]: event.target.value,
                                }))
                              }
                              placeholder="+10"
                              className="h-9 rounded-lg text-center"
                            />
                            <Button
                              size="sm"
                              className="h-9 rounded-lg bg-rose-400 px-4 font-semibold hover:bg-rose-500"
                              onClick={() => handleIncreaseStock(row)}
                              disabled={updateStockMutation.isPending || !stockValue}
                            >
                              Tăng
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="grid max-w-[250px] grid-cols-[140px_88px] items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={priceValue}
                              onChange={(event) =>
                                setPriceUpdates((current) => ({
                                  ...current,
                                  [row.variantId]: event.target.value,
                                }))
                              }
                              className="h-9 rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-lg px-3 font-semibold"
                              onClick={() => handleUpdatePrice(row)}
                              disabled={updateVariantMutation.isPending || Number(priceValue) === row.price}
                            >
                              Lưu giá
                            </Button>
                          </div>
                          <p className="mt-1.5 text-xs text-slate-400">{formatCurrency(row.price)}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {isOutOfStock && (
                            <span className="inline-flex min-w-20 justify-center whitespace-nowrap rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                              Hết hàng
                            </span>
                          )}
                          {isLowStock && (
                            <span className="inline-flex min-w-20 justify-center whitespace-nowrap rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              Sắp hết
                            </span>
                          )}
                          {!isOutOfStock && !isLowStock && (
                            <span className="inline-flex min-w-20 justify-center whitespace-nowrap rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              Đủ hàng
                            </span>
                          )}
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
