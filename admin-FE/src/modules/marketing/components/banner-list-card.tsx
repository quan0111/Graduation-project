import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { Banner } from "../types";

type Props = {
  banners: Banner[];
  isError?: boolean;
  isLoading?: boolean;
  pending?: boolean;
  onCreate: () => void;
};

const COPY = {
  title: "Banner",
  create: "T\u1ea1o banner",
  loading: "\u0110ang t\u1ea3i banner...",
  error: "Kh\u00f4ng th\u1ec3 t\u1ea3i banner.",
  empty: "Ch\u01b0a c\u00f3 banner.",
  priority: "\u01afu ti\u00ean",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "B\u1ea3n nh\u00e1p",
  ACTIVE: "\u0110ang b\u1eadt",
  PAUSED: "T\u1ea1m d\u1eebng",
  ENDED: "\u0110\u00e3 k\u1ebft th\u00fac",
};

const formatDate = (value?: string | null) => {
  return value ? new Date(value).toLocaleString("vi-VN") : null;
};

export function BannerListCard({ banners, isError = false, isLoading = false, pending = false, onCreate }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{COPY.title}</CardTitle>
          <CardDescription>{isLoading ? COPY.loading : `${banners.length} banner`}</CardDescription>
        </div>
        <Button onClick={onCreate} disabled={pending}>
          <Plus className="h-4 w-4" />
          {COPY.create}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isError && <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{COPY.error}</div>}

        {!isError &&
          banners.map((banner) => {
            const startsAt = formatDate(banner.startAt);
            const endsAt = formatDate(banner.endAt);

            return (
              <div key={banner.id} className="flex items-start gap-3 rounded-lg border p-3">
                <img src={banner.imageUrl} alt={banner.title} className="h-16 w-28 rounded object-cover" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{banner.title}</p>
                    <Badge variant="outline">{STATUS_LABEL[banner.status] || banner.status}</Badge>
                  </div>
                  {banner.subtitle && <p className="line-clamp-1 text-sm text-muted-foreground">{banner.subtitle}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{banner.position}</span>
                    <span>
                      {COPY.priority}: {banner.priority ?? 0}
                    </span>
                    {startsAt && <span>{startsAt}</span>}
                    {endsAt && <span>{endsAt}</span>}
                  </div>
                </div>
              </div>
            );
          })}

        {!isError && !isLoading && !banners.length && <p className="text-sm text-muted-foreground">{COPY.empty}</p>}
      </CardContent>
    </Card>
  );
}
