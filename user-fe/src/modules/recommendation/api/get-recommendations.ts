import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_ANALYTICS } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { IProduct } from "@/modules/product/types";
import { normalizeProduct } from "@/modules/product/utils/normalize-product";
import type { RecommendationQuery } from "@/modules/recommendation/types";
import { getRecommendationSessionId, getSessionProductIds } from "@/modules/recommendation/utils/recommendation-session";

const getRecommendations = async ({ topK = 10, productId, query }: RecommendationQuery = {}): Promise<IProduct[]> => {
  const recentProductIds = getSessionProductIds();
  const response = await apiClient.get(`${API_URL_ANALYTICS}/recommend/me`, {
    params: {
      top_k: topK,
      product_id: productId,
      explain: true,
      query,
      session_id: getRecommendationSessionId(),
      recent_product_ids: recentProductIds.length ? recentProductIds.join(",") : undefined,
    },
  });

  const products = Array.isArray(response.data) ? response.data : response.data?.products ?? [];
  return products.map(normalizeProduct);
};

export const useRecommendations = (
  query: RecommendationQuery = {},
  config?: Omit<UseQueryOptions<IProduct[], Error, IProduct[], [string, number, number, string]>, "queryKey" | "queryFn">,
) => {
  const topK = query.topK ?? 10;
  const productId = query.productId ?? 0;
  const searchQuery = query.query ?? "";

  return useQuery<IProduct[], Error, IProduct[], [string, number, number, string]>({
    queryKey: ["recommendations", topK, productId, searchQuery],
    queryFn: () => getRecommendations({ topK, productId: query.productId, query: searchQuery }),
    ...config,
  });
};
