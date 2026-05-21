import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Search } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_URL_INVENTORY } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useGetAllShop } from "@/modules/shop/api/shop/get-all-shop";

type InventoryLedger = {
  id: number;
  shopId: number;
  productId?: number | null;
  variantId?: number | null;
  orderId?: number | null;
  returnRequestId?: number | null;
  actorId?: number | null;
  type: string;
  quantityChange: number;
  stockBefore?: number | null;
  stockAfter?: number | null;
  reason?: string | null;
  createdAt: string;
  product?: { id: number; name: string } | null;
  variant?: { id: number; name: string; sku?: string | null; stock: number } | null;
};

const getShopLedger = async (shopId: number): Promise<InventoryLedger[]> => {
  const response = await apiClient.get(`${API_URL_INVENTORY}/shops/${shopId}/ledger`, {
    params: { limit: 200 },
  });
  return response.data;
};

export default function AdminInventoryPage() {
  const [selectedShopId, setSelectedShopId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const { data: shops = [], isLoading: shopsLoading } = useGetAllShop();
  const shopId = typeof selectedShopId === "number" ? selectedShopId : undefined;

  const { data: ledger = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "inventory-ledger", shopId],
    queryFn: () => getShopLedger(shopId as number),
    enabled: Boolean(shopId),
  });

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return ledger;

    return ledger.filter((item) => {
      const haystack = [
        item.type,
        item.reason,
        item.product?.name,
        item.variant?.name,
        item.variant?.sku,
        item.orderId ? `order ${item.orderId}` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [ledger, search]);

  const totalIncrease = ledger
    .filter((item) => item.quantityChange > 0)
    .reduce((sum, item) => sum + item.quantityChange, 0);
  const totalDecrease = Math.abs(
    ledger
      .filter((item) => item.quantityChange < 0)
      .reduce((sum, item) => sum + item.quantityChange, 0),
  );

  return (
    <main className="flex-1 space-y-6 overflow-auto p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Kho hàng</p>
          <h1 className="mt-2 text-2xl font-bold">Lịch sử kho</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi lịch sử tăng/giảm kho theo shop, sản phẩm và variant.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedShopId}
            onChange={(event) => setSelectedShopId(event.target.value ? Number(event.target.value) : "")}
            className="h-10 min-w-64 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{shopsLoading ? "Đang tải shop..." : "Chọn shop"}</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm sản phẩm, SKU, lý do..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Số dòng ledger" value={ledger.length.toLocaleString("vi-VN")} />
        <Metric title="Tổng nhập kho" value={`+${totalIncrease.toLocaleString("vi-VN")}`} />
        <Metric title="Tổng xuất kho" value={`-${totalDecrease.toLocaleString("vi-VN")}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="size-5" />
            Lịch sử kho
          </CardTitle>
          <CardDescription>
            {shopId ? `${filtered.length} bản ghi` : "Chọn shop để xem lịch sử kho"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!shopId ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Chưa chọn shop.</p>
          ) : null}

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Đang tải lịch sử kho...</p>
          ) : null}

          {isError ? (
            <p className="py-8 text-center text-sm text-destructive">Không thể tải lịch sử kho.</p>
          ) : null}

          {shopId && !isLoading && !isError ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-semibold">Thời gian</th>
                    <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
                    <th className="px-4 py-3 text-left font-semibold">Phân loại</th>
                    <th className="px-4 py-3 text-right font-semibold">Thay đổi</th>
                    <th className="px-4 py-3 text-right font-semibold">Tồn trước/sau</th>
                    <th className="px-4 py-3 text-left font-semibold">Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 font-medium">{item.product?.name || `#${item.productId ?? "-"}`}</td>
                      <td className="px-4 py-3">
                        {item.variant ? (
                          <div>
                            <p>{item.variant.name}</p>
                            {item.variant.sku ? <p className="text-xs text-muted-foreground">SKU {item.variant.sku}</p> : null}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${item.quantityChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {item.quantityChange > 0 ? "+" : ""}
                        {item.quantityChange}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(item.stockBefore ?? "-").toString()} → {(item.stockAfter ?? "-").toString()}
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="line-clamp-2">{item.reason || item.type}</p>
                        {item.orderId ? <p className="text-xs text-muted-foreground">Đơn #{item.orderId}</p> : null}
                        {item.returnRequestId ? <p className="text-xs text-muted-foreground">Yêu cầu đổi trả #{item.returnRequestId}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Không có bản ghi phù hợp.</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
