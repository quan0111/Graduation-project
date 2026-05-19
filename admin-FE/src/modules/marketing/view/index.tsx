import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL_FLASH_SALE, API_URL_MARKETING } from "@/constant/config";
import { apiClient } from "@/lib/api";

type Banner = {
  id: number;
  title: string;
  position: string;
  status: string;
  imageUrl: string;
  startAt?: string | null;
  endAt?: string | null;
};

type FlashSale = {
  id: number;
  name: string;
  startsAt: string;
  endsAt: string;
  status: string;
};

export default function MarketingPage() {
  const queryClient = useQueryClient();
  const { data: banners = [] } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async (): Promise<Banner[]> => {
      const res = await apiClient.get(`${API_URL_MARKETING}/admin/banners`);
      return res.data;
    },
  });
  const { data: flashSales = [] } = useQuery({
    queryKey: ["admin", "flash-sales"],
    queryFn: async (): Promise<FlashSale[]> => {
      const res = await apiClient.get(API_URL_FLASH_SALE);
      return res.data;
    },
  });

  const createBanner = useMutation({
    mutationFn: async (payload: Partial<Banner>) => {
      const res = await apiClient.post(`${API_URL_MARKETING}/banners`, payload);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "banners"] }),
  });
  const createFlashSale = useMutation({
    mutationFn: async (payload: Partial<FlashSale>) => {
      const res = await apiClient.post(API_URL_FLASH_SALE, payload);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "flash-sales"] }),
  });

  const handleCreateBanner = async () => {
    const title = window.prompt("Ten banner");
    if (!title?.trim()) return;
    const imageUrl = window.prompt("Image URL");
    if (!imageUrl?.trim()) return;
    await createBanner.mutateAsync({
      title,
      imageUrl,
      position: "HOME_TOP",
      status: "DRAFT",
    });
  };

  const handleCreateFlashSale = async () => {
    const name = window.prompt("Ten flash sale");
    if (!name?.trim()) return;
    const now = new Date();
    const endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await createFlashSale.mutateAsync({
      name,
      startsAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      status: "DRAFT",
    });
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Marketing</h1>
        <p className="text-muted-foreground">Quan ly banner va flash sale tu schema backend.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Banner</CardTitle>
              <CardDescription>{banners.length} banner</CardDescription>
            </div>
            <Button onClick={handleCreateBanner} disabled={createBanner.isPending}>
              <Plus className="h-4 w-4" />
              Tao banner
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center gap-3 rounded-lg border p-3">
                <img src={banner.imageUrl} alt={banner.title} className="h-14 w-24 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{banner.title}</p>
                  <p className="text-sm text-muted-foreground">{banner.position}</p>
                </div>
                <Badge variant="outline">{banner.status}</Badge>
              </div>
            ))}
            {!banners.length && <p className="text-sm text-muted-foreground">Chua co banner.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Flash sale</CardTitle>
              <CardDescription>{flashSales.length} chuong trinh</CardDescription>
            </div>
            <Button onClick={handleCreateFlashSale} disabled={createFlashSale.isPending}>
              <Plus className="h-4 w-4" />
              Tao flash sale
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {flashSales.map((sale) => (
              <div key={sale.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{sale.name}</p>
                  <Badge variant="outline">{sale.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(sale.startsAt).toLocaleString("vi-VN")} - {new Date(sale.endsAt).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
            {!flashSales.length && <p className="text-sm text-muted-foreground">Chua co flash sale.</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
