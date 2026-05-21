import { Eye, MousePointerClick, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useBannerStats } from "../api/marketing";
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
  create: "Tạo banner",
  loading: "Đang tải banner...",
  error: "Không thể tải banner.",
  empty: "Chưa có banner.",
  priority: "Ưu tiên",
  ctr: "CTR",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bản nháp",
  ACTIVE: "Đang bật",
  PAUSED: "Tạm dừng",
  ENDED: "Đã kết thúc",
};

const POSITION_LABEL: Record<string, string> = {
  HOME_TOP: "Đầu trang chủ",
  HOME_MIDDLE: "Giữa trang chủ",
  HOME_BOTTOM: "Cuối trang chủ",
  CATEGORY_TOP: "Đầu danh mục",
  PRODUCT_DETAIL: "Chi tiết sản phẩm",
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString("vi-VN") : null);

const formatCtr = (value?: number) => `${Math.round((value ?? 0) * 10000) / 100}%`;

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
        {isError ? <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{COPY.error}</div> : null}

        {!isError && banners.map((banner) => <BannerRow key={banner.id} banner={banner} />)}

        {!isError && !isLoading && !banners.length ? <p className="text-sm text-muted-foreground">{COPY.empty}</p> : null}
      </CardContent>
    </Card>
  );
}

function BannerRow({ banner }: { banner: Banner }) {
  const { data: stats, isLoading } = useBannerStats(banner.id);
  const startsAt = formatDate(banner.startAt);
  const endsAt = formatDate(banner.endAt);

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <img src={banner.imageUrl} alt={banner.title} className="h-16 w-28 rounded object-cover" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{banner.title}</p>
          <Badge variant="outline">{STATUS_LABEL[banner.status] || banner.status}</Badge>
          <Badge variant="secondary">{POSITION_LABEL[banner.position] || banner.position}</Badge>
        </div>
        {banner.subtitle ? <p className="line-clamp-1 text-sm text-muted-foreground">{banner.subtitle}</p> : null}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {COPY.priority}: {banner.priority ?? 0}
          </span>
          {startsAt ? <span>Bắt đầu: {startsAt}</span> : null}
          {endsAt ? <span>Kết thúc: {endsAt}</span> : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700">
            <Eye className="size-3" />
            {isLoading ? "..." : `${stats?.views ?? 0} lượt xem`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700">
            <MousePointerClick className="size-3" />
            {isLoading ? "..." : `${stats?.clicks ?? 0} lượt nhấp`}
          </span>
          <span className="inline-flex rounded-full bg-orange-50 px-2 py-1 font-medium text-orange-700">
            {COPY.ctr}: {isLoading ? "..." : formatCtr(stats?.ctr)}
          </span>
        </div>
      </div>
    </div>
  );
}
