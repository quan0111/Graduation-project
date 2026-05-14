import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_URL_ANALYTICS } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { IProduct } from "@/modules/product/types";
import { normalizeProduct } from "@/modules/product/utils/normalize-product";
import type { RecommendationQuery } from "@/modules/recommendation/types";

const getRecommendations = async ({ topK = 10, productId }: RecommendationQuery = {}): Promise<IProduct[]> => {
  const response = await apiClient.get(`${API_URL_ANALYTICS}/recommend/me`, {
    params: {
      top_k: topK,
      product_id: productId,
      explain: true,
    },
  });

  const products = Array.isArray(response.data) ? response.data : response.data?.products ?? [];
  return products.map(normalizeProduct);
};

export const useRecommendations = (
  query: RecommendationQuery = {},
  config?: Omit<UseQueryOptions<IProduct[], Error, IProduct[], [string, number, number]>, "queryKey" | "queryFn">,
) => {
  const topK = query.topK ?? 10;
  const productId = query.productId ?? 0;

  return useQuery<IProduct[], Error, IProduct[], [string, number, number]>({
    queryKey: ["recommendations", topK, productId],
    queryFn: () => getRecommendations({ topK, productId: query.productId }),
    ...config,
  });
};
