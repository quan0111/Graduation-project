import { PackagePlus, Pause, Play, Plus } from "lucide-react";

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
        <Button onClick={onCreate} disabled={pending}>
          <Plus className="h-4 w-4" />
          {COPY.create}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isError && <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{COPY.error}</div>}

        {!isError &&
          flashSales.map((sale) => {
            const soldCount = sale.items?.reduce((sum, item) => sum + Number(item.soldCount || 0), 0) || 0;
            const previewItems = sale.items?.slice(0, 3) ?? [];
            const remainingItems = Math.max((sale.items?.length || 0) - previewItems.length, 0);
            const isActive = sale.status === "ACTIVE";

            return (
              <div key={sale.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{sale.name}</p>
                  <Badge variant="outline">{STATUS_LABEL[sale.status] || sale.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(sale.startsAt)} - {formatDateTime(sale.endsAt)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sale.items?.length || 0} {COPY.product} {"\u00b7"} {COPY.sold} {soldCount}
                </p>

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
