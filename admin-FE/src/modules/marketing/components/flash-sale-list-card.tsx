import { Copy, PackagePlus, Pause, Play, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { FlashSale } from "../types";

type Props = {
  flashSales: FlashSale[];
  addingItem?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  pending?: boolean;
  updating?: boolean;
  onAddItem: (sale: FlashSale) => void;
  onCreate: () => void;
  onToggleStatus: (sale: FlashSale) => void;
};

const COPY = {
  title: "Flash sale",
  create: "T\u1ea1o flash sale",
  addItem: "Th\u00eam s\u1ea3n ph\u1ea9m",
  copyAllLink: "Copy link tổng",
  copyLink: "Copy link banner",
  linkLabel: "Link dán vào banner",
  copied: "Đã copy link flash sale",
  live: "Đang hiển thị",
  scheduled: "Chưa tới giờ",
  expired: "Hết giờ",
  activate: "K\u00edch ho\u1ea1t",
  pause: "T\u1ea1m d\u1eebng",
  loading: "\u0110ang t\u1ea3i flash sale...",
  error: "Kh\u00f4ng th\u1ec3 t\u1ea3i flash sale.",
  empty: "Ch\u01b0a c\u00f3 flash sale.",
  product: "s\u1ea3n ph\u1ea9m",
  sold: "\u0110\u00e3 b\u00e1n",
  more: "m\u1ee5c kh\u00e1c",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "B\u1ea3n nh\u00e1p",
  ACTIVE: "\u0110ang b\u1eadt",
  PAUSED: "T\u1ea1m d\u1eebng",
  ENDED: "\u0110\u00e3 k\u1ebft th\u00fac",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount);
};

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString("vi-VN");
};

const FLASH_SALE_INDEX_LINK = "/flash-sale";

const getFlashSaleLink = (saleId: number) => `/flash-sale?campaign=${saleId}`;

const getRuntimeLabel = (sale: FlashSale) => {
  if (sale.status !== "ACTIVE") {
    return null;
  }

  const now = Date.now();
  const startsAt = new Date(sale.startsAt).getTime();
  const endsAt = new Date(sale.endsAt).getTime();

  if (startsAt > now) {
    return COPY.scheduled;
  }
  if (endsAt < now) {
    return COPY.expired;
  }
  return COPY.live;
};

const copyLink = async (link: string) => {
  await navigator.clipboard.writeText(link);
  toast.success(COPY.copied);
};

const copyFlashSaleLink = async (saleId: number) => {
  await copyLink(getFlashSaleLink(saleId));
};

export function FlashSaleListCard({
  flashSales,
  addingItem = false,
  isError = false,
  isLoading = false,
  pending = false,
  updating = false,
  onAddItem,
  onCreate,
  onToggleStatus,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{COPY.title}</CardTitle>
          <CardDescription>{isLoading ? COPY.loading : `${flashSales.length} ch\u01b0\u01a1ng tr\u00ecnh`}</CardDescription>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => void copyLink(FLASH_SALE_INDEX_LINK)}>
            <Copy className="h-4 w-4" />
            {COPY.copyAllLink}
          </Button>
          <Button onClick={onCreate} disabled={pending}>
            <Plus className="h-4 w-4" />
            {COPY.create}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isError && <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{COPY.error}</div>}

        {!isError &&
          flashSales.map((sale) => {
            const soldCount = sale.items?.reduce((sum, item) => sum + Number(item.soldCount || 0), 0) || 0;
            const previewItems = sale.items?.slice(0, 3) ?? [];
            const remainingItems = Math.max((sale.items?.length || 0) - previewItems.length, 0);
            const isActive = sale.status === "ACTIVE";
            const flashSaleLink = getFlashSaleLink(sale.id);
            const runtimeLabel = getRuntimeLabel(sale);

            return (
              <div key={sale.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{sale.name}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Badge variant="outline">{STATUS_LABEL[sale.status] || sale.status}</Badge>
                    {runtimeLabel ? <Badge variant={runtimeLabel === COPY.live ? "default" : "secondary"}>{runtimeLabel}</Badge> : null}
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(sale.startsAt)} - {formatDateTime(sale.endsAt)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sale.items?.length || 0} {COPY.product} {"\u00b7"} {COPY.sold} {soldCount}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">{COPY.linkLabel}:</span>
                  <code className="rounded bg-background px-2 py-1 font-mono">{flashSaleLink}</code>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => void copyFlashSaleLink(sale.id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {COPY.copyLink}
                  </Button>
                </div>

                {previewItems.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-lg bg-muted/40 p-2">
                    {previewItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate">
                          Product #{item.productId}
                          {item.variantId ? ` \u00b7 Variant #${item.variantId}` : ""} {"\u00b7"} Shop #{item.shopId}
                        </span>
                        <span className="shrink-0 font-medium">
                          {formatCurrency(item.salePrice)}
                          {"\u0111"}
                        </span>
                      </div>
                    ))}
                    {remainingItems > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{remainingItems} {COPY.more}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onAddItem(sale)} disabled={addingItem}>
                    <PackagePlus className="h-4 w-4" />
                    {COPY.addItem}
                  </Button>
                  <Button
                    size="sm"
                    variant={isActive ? "secondary" : "default"}
                    onClick={() => onToggleStatus(sale)}
                    disabled={updating}
                  >
                    {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isActive ? COPY.pause : COPY.activate}
                  </Button>
                </div>
              </div>
            );
          })}

        {!isError && !isLoading && !flashSales.length && <p className="text-sm text-muted-foreground">{COPY.empty}</p>}
      </CardContent>
    </Card>
  );
}
