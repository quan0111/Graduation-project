import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Percent } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_URL_FINANCE } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useGetCategories, type Category } from "@/modules/categories/api/category";
import { useGetAllShop } from "@/modules/shop/api/shop/get-all-shop";

type ShopCommissionConfig = {
  id: number;
  shopId: number;
  commissionRate: number;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
  shop?: { id: number; name: string } | null;
};

type CategoryCommissionConfig = {
  id: number;
  categoryId: number;
  commissionRate: number;
  isActive: boolean;
  category?: { id: number; name: string } | null;
};

type ShopPayload = {
  shopId: number;
  commissionRate: number;
  isActive: boolean;
};

type CategoryPayload = {
  categoryId: number;
  commissionRate: number;
  isActive: boolean;
};

const toPercent = (rate: number) => `${Math.round(rate * 10000) / 100}%`;
const MIN_COMMISSION_PERCENT = 3;
const MAX_COMMISSION_PERCENT = 7;

const parseRate = (value: string) => {
  const percent = Number(value);
  if (!Number.isFinite(percent) || percent < MIN_COMMISSION_PERCENT || percent > MAX_COMMISSION_PERCENT) {
    return null;
  }
  return percent / 100;
};

const flattenCategories = (categories: Category[]): Category[] =>
  categories.flatMap((category) => [category, ...flattenCategories(category.children ?? [])]);

const getShopConfigs = async (): Promise<ShopCommissionConfig[]> => {
  const response = await apiClient.get<ShopCommissionConfig[]>(`${API_URL_FINANCE}/commission-configs/shops`);
  return response.data;
};

const getCategoryConfigs = async (): Promise<CategoryCommissionConfig[]> => {
  const response = await apiClient.get<CategoryCommissionConfig[]>(`${API_URL_FINANCE}/commission-configs/categories`);
  return response.data;
};

const upsertShopConfig = async (payload: ShopPayload): Promise<ShopCommissionConfig> => {
  const response = await apiClient.put<ShopCommissionConfig>(`${API_URL_FINANCE}/commission-configs/shops`, payload);
  return response.data;
};

const upsertCategoryConfig = async (payload: CategoryPayload): Promise<CategoryCommissionConfig> => {
  const response = await apiClient.put<CategoryCommissionConfig>(`${API_URL_FINANCE}/commission-configs/categories`, payload);
  return response.data;
};

export function CommissionConfigCard() {
  const queryClient = useQueryClient();
  const [shopId, setShopId] = useState("");
  const [shopRate, setShopRate] = useState("5");
  const [categoryId, setCategoryId] = useState("");
  const [categoryRate, setCategoryRate] = useState("5");

  const { data: shops = [] } = useGetAllShop();
  const { data: categories = [] } = useGetCategories();
  const allCategories = useMemo(() => flattenCategories(categories), [categories]);

  const shopConfigsQuery = useQuery({
    queryKey: ["admin", "commission-configs", "shops"],
    queryFn: getShopConfigs,
  });
  const categoryConfigsQuery = useQuery({
    queryKey: ["admin", "commission-configs", "categories"],
    queryFn: getCategoryConfigs,
  });

  const invalidateConfigs = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "commission-configs"] });
  };

  const shopMutation = useMutation({
    mutationFn: upsertShopConfig,
    onSuccess: async () => {
      toast.success("Đã lưu hoa hồng theo shop");
      await invalidateConfigs();
    },
    onError: () => toast.error("Không thể lưu hoa hồng theo shop"),
  });

  const categoryMutation = useMutation({
    mutationFn: upsertCategoryConfig,
    onSuccess: async () => {
      toast.success("Đã lưu hoa hồng theo danh mục");
      await invalidateConfigs();
    },
    onError: () => toast.error("Không thể lưu hoa hồng theo danh mục"),
  });

  const handleSaveShop = () => {
    const rate = parseRate(shopRate);
    const selectedShopId = Number(shopId);
    if (!selectedShopId || rate === null) {
      toast.error("Chọn shop và nhập tỷ lệ từ 3% đến 7%");
      return;
    }
    shopMutation.mutate({ shopId: selectedShopId, commissionRate: rate, isActive: true });
  };

  const handleSaveCategory = () => {
    const rate = parseRate(categoryRate);
    const selectedCategoryId = Number(categoryId);
    if (!selectedCategoryId || rate === null) {
      toast.error("Chọn danh mục và nhập tỷ lệ từ 3% đến 7%");
      return;
    }
    categoryMutation.mutate({ categoryId: selectedCategoryId, commissionRate: rate, isActive: true });
  };

  const shopConfigs = shopConfigsQuery.data ?? [];
  const categoryConfigs = categoryConfigsQuery.data ?? [];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="size-5 text-primary" />
          Cấu hình hoa hồng
        </CardTitle>
        <CardDescription>
          Phí nền tảng nằm trong 3-7%. Nếu không cấu hình riêng, hệ thống tự tính theo giá trị dòng hàng: dưới 500k là 7%, 500k-1tr là 6%, 1-2tr là 5%, 2-5tr là 4%, từ 5tr là 3%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="mb-3 font-medium">Theo shop</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={shopId}
                onChange={(event) => setShopId(event.currentTarget.value)}
              >
                <option value="">Chọn shop</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
              <Input
                value={shopRate}
                onChange={(event) => setShopRate(event.currentTarget.value)}
                type="number"
                min={MIN_COMMISSION_PERCENT}
                max={MAX_COMMISSION_PERCENT}
                step={0.1}
              />
              <Button onClick={handleSaveShop} disabled={shopMutation.isPending}>
                Lưu
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 font-medium">Theo danh mục</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={categoryId}
                onChange={(event) => setCategoryId(event.currentTarget.value)}
              >
                <option value="">Chọn danh mục</option>
                {allCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Input
                value={categoryRate}
                onChange={(event) => setCategoryRate(event.currentTarget.value)}
                type="number"
                min={MIN_COMMISSION_PERCENT}
                max={MAX_COMMISSION_PERCENT}
                step={0.1}
              />
              <Button onClick={handleSaveCategory} disabled={categoryMutation.isPending}>
                Lưu
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ConfigList
            title="Shop đang cấu hình"
            loading={shopConfigsQuery.isLoading}
            rows={shopConfigs.map((config) => ({
              id: config.id,
              name: config.shop?.name || `Shop #${config.shopId}`,
              rate: config.commissionRate,
              active: config.isActive,
            }))}
          />
          <ConfigList
            title="Danh mục đang cấu hình"
            loading={categoryConfigsQuery.isLoading}
            rows={categoryConfigs.map((config) => ({
              id: config.id,
              name: config.category?.name || `Danh mục #${config.categoryId}`,
              rate: config.commissionRate,
              active: config.isActive,
            }))}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigList({
  title,
  loading,
  rows,
}: {
  title: string;
  loading: boolean;
  rows: Array<{ id: number; name: string; rate: number; active: boolean }>;
}) {
  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3 font-medium">{title}</div>
      <div className="divide-y">
        {loading ? <p className="px-4 py-3 text-sm text-muted-foreground">Đang tải...</p> : null}
        {!loading && !rows.length ? <p className="px-4 py-3 text-sm text-muted-foreground">Chưa có cấu hình.</p> : null}
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="truncate">{row.name}</span>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">{toPercent(row.rate)}</Badge>
              <Badge variant={row.active ? "default" : "secondary"}>{row.active ? "Đang bật" : "Tắt"}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
