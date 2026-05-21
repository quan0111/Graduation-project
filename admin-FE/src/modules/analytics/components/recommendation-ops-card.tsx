import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Database, RefreshCw, Target } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL_ANALYTICS } from "@/constant/config";
import { apiClient } from "@/lib/api";

type RecommendationMetrics = {
  k: number;
  daysBack: number;
  hitRateAtK: number;
  ndcgAtK: number;
  ctr: number;
  conversionRate: number;
  usersEvaluated: number;
  interactionsEvaluated: number;
  events: {
    views: number;
    clicks: number;
    purchases: number;
  };
};

type TrainResult = {
  trainedAt?: string;
  interactionCount?: number;
  rankingRows?: number;
  ltrBackend?: string;
  embeddingCount?: number;
  userCount?: number;
  itemCount?: number;
};

type SyncResult = {
  requested: number;
  written: number;
  backend: string;
};

const percent = (value: number) => `${Math.round(value * 10000) / 100}%`;

const compactNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);

const getRecommendationMetrics = async (): Promise<RecommendationMetrics> => {
  const response = await apiClient.get<RecommendationMetrics>(`${API_URL_ANALYTICS}/recommend/evaluate?k=10&days_back=180`);
  return response.data;
};

const trainRecommendation = async (): Promise<TrainResult> => {
  const response = await apiClient.post<TrainResult>(`${API_URL_ANALYTICS}/recommend/train`);
  return response.data;
};

const syncEmbeddings = async (): Promise<SyncResult> => {
  const response = await apiClient.post<SyncResult>(`${API_URL_ANALYTICS}/recommend/sync-embeddings`);
  return response.data;
};

export function RecommendationOpsCard() {
  const queryClient = useQueryClient();
  const metricsQuery = useQuery({
    queryKey: ["admin", "recommendation", "evaluate"],
    queryFn: getRecommendationMetrics,
  });

  const trainMutation = useMutation({
    mutationFn: trainRecommendation,
    onSuccess: async () => {
      toast.success("Đã huấn luyện lại Recommendation AI");
      await queryClient.invalidateQueries({ queryKey: ["admin", "recommendation", "evaluate"] });
    },
    onError: () => toast.error("Không thể huấn luyện Recommendation AI"),
  });

  const syncMutation = useMutation({
    mutationFn: syncEmbeddings,
    onSuccess: async () => {
      toast.success("Đã đồng bộ embedding sản phẩm");
      await queryClient.invalidateQueries({ queryKey: ["admin", "recommendation", "evaluate"] });
    },
    onError: () => toast.error("Không thể đồng bộ embedding"),
  });

  const metrics = metricsQuery.data;
  const trainResult = trainMutation.data;
  const syncResult = syncMutation.data;
  const isBusy = trainMutation.isPending || syncMutation.isPending;

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            Vận hành Recommendation AI
          </CardTitle>
          <CardDescription>
            Huấn luyện LTR, two-tower, NCF, đồng bộ pgvector và theo dõi HitRate/NDCG.
          </CardDescription>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => syncMutation.mutate()} disabled={isBusy}>
            <Database className="size-4" />
            Đồng bộ embedding
          </Button>
          <Button onClick={() => trainMutation.mutate()} disabled={isBusy}>
            <RefreshCw className={`size-4 ${trainMutation.isPending ? "animate-spin" : ""}`} />
            Huấn luyện lại
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="HitRate@10" value={metricsQuery.isLoading ? "..." : percent(metrics?.hitRateAtK ?? 0)} />
          <Metric label="NDCG@10" value={metricsQuery.isLoading ? "..." : percent(metrics?.ndcgAtK ?? 0)} />
          <Metric label="CTR" value={metricsQuery.isLoading ? "..." : percent(metrics?.ctr ?? 0)} />
          <Metric label="Conversion" value={metricsQuery.isLoading ? "..." : percent(metrics?.conversionRate ?? 0)} />
        </div>

        <div className="grid gap-4 text-sm md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="font-medium">Tập đánh giá</p>
            <p className="mt-1 text-muted-foreground">
              {compactNumber(metrics?.usersEvaluated ?? 0)} người dùng · {compactNumber(metrics?.interactionsEvaluated ?? 0)} tương tác
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-medium">Hành vi</p>
            <p className="mt-1 text-muted-foreground">
              {compactNumber(metrics?.events.views ?? 0)} view · {compactNumber(metrics?.events.clicks ?? 0)} click · {compactNumber(metrics?.events.purchases ?? 0)} mua
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-medium">Lần chạy gần nhất</p>
            <p className="mt-1 text-muted-foreground">
              {trainResult?.trainedAt ? new Date(trainResult.trainedAt).toLocaleString("vi-VN") : "Chưa chạy trong phiên này"}
            </p>
          </div>
        </div>

        {(trainResult || syncResult) && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
            <div className="flex items-start gap-2">
              <Target className="mt-0.5 size-4" />
              <p>
                {trainResult
                  ? `Train: ${compactNumber(trainResult.interactionCount ?? 0)} tương tác, ${compactNumber(trainResult.rankingRows ?? 0)} dòng ranking, LTR ${trainResult.ltrBackend ?? "model"}. `
                  : ""}
                {syncResult
                  ? `Embedding: ghi ${compactNumber(syncResult.written)} / ${compactNumber(syncResult.requested)} sản phẩm vào ${syncResult.backend}.`
                  : `Embedding: ${compactNumber(trainResult?.embeddingCount ?? 0)} sản phẩm.`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
