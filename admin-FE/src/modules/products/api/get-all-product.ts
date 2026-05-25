import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { API_URL_PRODUCT } from "@/constant/config";
import type { QueryConfig } from "@/lib/react-query";
import type { IProduct } from "../types";

type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
};

export const getProductsPage = async ({
  page = 1,
  limit = 100,
  search,
  categoryId,
}: ProductListParams = {}): Promise<IProduct[]> => {
  const res = await apiClient.get(`${API_URL_PRODUCT}`, {
    params: {
      page,
      limit,
      search: search || undefined,
      categoryId: categoryId || undefined,
    },
  });
  return res.data;
};

export const getProducts = async (params: Omit<ProductListParams, "page"> = {}): Promise<IProduct[]> => {
  const limit = params.limit ?? 100;
  const products: IProduct[] = [];
  let page = 1;

  while (true) {
    const chunk = await getProductsPage({ ...params, page, limit });
    products.push(...chunk);
    if (chunk.length < limit) break;
    page += 1;
  }

  return products;
};

type UseProductsOptions = {
  config?: QueryConfig<typeof getProducts>;
};

export const useProducts = ({ config }: UseProductsOptions = {}) => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    ...config,
  });
};
